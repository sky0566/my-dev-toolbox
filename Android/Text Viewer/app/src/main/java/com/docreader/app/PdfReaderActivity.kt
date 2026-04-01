package com.docreader.app

import android.net.Uri
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.SeekBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.docreader.app.adapter.PdfTocAdapter
import com.docreader.app.databinding.ActivityPdfReaderBinding
import com.docreader.app.model.PdfTocItem
import com.docreader.app.util.PreferenceManager
import com.github.barteksc.pdfviewer.listener.OnLoadCompleteListener
import com.github.barteksc.pdfviewer.listener.OnPageChangeListener
import com.github.barteksc.pdfviewer.listener.OnPageErrorListener
import com.github.barteksc.pdfviewer.listener.OnTapListener
import com.github.barteksc.pdfviewer.scroll.DefaultScrollHandle
import com.shockwave.pdfium.PdfDocument
import java.io.File

class PdfReaderActivity : AppCompatActivity(), OnPageChangeListener, OnLoadCompleteListener, OnPageErrorListener {

    private lateinit var binding: ActivityPdfReaderBinding
    private lateinit var preferenceManager: PreferenceManager
    private lateinit var tocAdapter: PdfTocAdapter
    
    private var filePath: String = ""
    private var fileName: String = ""
    private var currentPage: Int = 0
    private var totalPages: Int = 0
    private var tocItems = mutableListOf<PdfTocItem>()
    private var isNightMode: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPdfReaderBinding.inflate(layoutInflater)
        setContentView(binding.root)

        preferenceManager = PreferenceManager(this)
        filePath = intent.getStringExtra("file_path") ?: ""
        fileName = intent.getStringExtra("file_name") ?: "PDF Document"
        isNightMode = preferenceManager.isNightMode()

        setupUI()
        loadPdfFile()
    }

    private fun setupUI() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            title = fileName
        }

        // Setup TOC adapter
        tocAdapter = PdfTocAdapter { tocItem ->
            binding.pdfView.jumpTo(tocItem.pageNumber)
            binding.drawerLayout.closeDrawer(GravityCompat.END)
        }
        binding.recyclerToc.apply {
            layoutManager = LinearLayoutManager(this@PdfReaderActivity)
            adapter = tocAdapter
        }

        // Page navigation
        binding.seekbarPage.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser && totalPages > 0) {
                    binding.textPageIndicator.text = "${progress + 1} / $totalPages"
                }
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                seekBar?.let {
                    binding.pdfView.jumpTo(it.progress)
                }
            }
        })

        // Night mode
        binding.switchNightMode.isChecked = isNightMode
        binding.switchNightMode.setOnCheckedChangeListener { _, isChecked ->
            isNightMode = isChecked
            preferenceManager.setNightMode(isChecked)
            applyNightMode()
        }

        // TOC button
        binding.fabToc.setOnClickListener {
            if (tocItems.isNotEmpty()) {
                binding.drawerLayout.openDrawer(GravityCompat.END)
            } else {
                Toast.makeText(this, getString(R.string.no_pdf_toc), Toast.LENGTH_SHORT).show()
            }
        }

        applyNightMode()
    }

    private fun loadPdfFile() {
        val file = File(filePath)
        if (!file.exists()) {
            Toast.makeText(this, getString(R.string.file_not_found), Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        binding.progressBar.visibility = View.VISIBLE

        binding.pdfView.fromFile(file)
            .defaultPage(0)
            .onPageChange(this)
            .enableAnnotationRendering(true)
            .onLoad(this)
            .onPageError(this)
            .scrollHandle(DefaultScrollHandle(this))
            .spacing(10)
            .onTap(OnTapListener {
                toggleToolbar()
                true
            })
            .nightMode(isNightMode)
            .load()
    }

    override fun onPageChanged(page: Int, pageCount: Int) {
        currentPage = page
        totalPages = pageCount
        binding.textPageIndicator.text = "${page + 1} / $pageCount"
        binding.seekbarPage.max = pageCount - 1
        binding.seekbarPage.progress = page
        supportActionBar?.subtitle = "Page ${page + 1} of $pageCount"
    }

    override fun loadComplete(nbPages: Int) {
        binding.progressBar.visibility = View.GONE
        totalPages = nbPages
        binding.seekbarPage.max = nbPages - 1

        // Extract table of contents
        extractTableOfContents()
    }

    private fun extractTableOfContents() {
        try {
            val tableOfContents = binding.pdfView.tableOfContents
            if (tableOfContents != null && tableOfContents.isNotEmpty()) {
                tocItems.clear()
                parseBookmarks(tableOfContents, 0)
                tocAdapter.submitList(tocItems.toList())
                
                if (tocItems.isNotEmpty()) {
                    binding.fabToc.visibility = View.VISIBLE
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun parseBookmarks(bookmarks: List<PdfDocument.Bookmark>, level: Int) {
        for (bookmark in bookmarks) {
            tocItems.add(PdfTocItem(
                title = bookmark.title,
                pageNumber = bookmark.pageIdx.toInt(),
                level = level
            ))
            if (bookmark.hasChildren()) {
                parseBookmarks(bookmark.children, level + 1)
            }
        }
    }

    private fun applyNightMode() {
        if (::binding.isInitialized) {
            binding.pdfView.setNightMode(isNightMode)
            binding.pdfView.invalidate()
            
            if (isNightMode) {
                binding.root.setBackgroundColor(0xFF1a1a1a.toInt())
                binding.layoutPageControl.setBackgroundColor(0xCC1a1a1a.toInt())
            } else {
                binding.root.setBackgroundColor(0xFFfafafa.toInt())
                binding.layoutPageControl.setBackgroundColor(0xCCffffff.toInt())
            }
        }
    }

    private fun toggleToolbar() {
        if (binding.appBarLayout.visibility == View.VISIBLE) {
            binding.appBarLayout.visibility = View.GONE
            binding.layoutPageControl.visibility = View.GONE
            binding.layoutSettings.visibility = View.GONE
        } else {
            binding.appBarLayout.visibility = View.VISIBLE
            binding.layoutPageControl.visibility = View.VISIBLE
        }
    }

    override fun onPageError(page: Int, t: Throwable?) {
        Toast.makeText(this, "Error loading page ${page + 1}", Toast.LENGTH_SHORT).show()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_reader, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                finish()
                true
            }
            R.id.action_settings -> {
                binding.layoutSettings.visibility = if (binding.layoutSettings.visibility == View.VISIBLE) {
                    View.GONE
                } else {
                    View.VISIBLE
                }
                true
            }
            R.id.action_toc -> {
                if (tocItems.isNotEmpty()) {
                    binding.drawerLayout.openDrawer(GravityCompat.END)
                } else {
                    Toast.makeText(this, getString(R.string.no_pdf_toc), Toast.LENGTH_SHORT).show()
                }
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onBackPressed() {
        when {
            binding.drawerLayout.isDrawerOpen(GravityCompat.END) -> {
                binding.drawerLayout.closeDrawer(GravityCompat.END)
            }
            else -> super.onBackPressed()
        }
    }
}
