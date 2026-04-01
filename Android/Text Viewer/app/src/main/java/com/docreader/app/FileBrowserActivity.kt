package com.docreader.app

import android.content.Intent
import android.os.Bundle
import android.os.Environment
import android.view.MenuItem
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.docreader.app.adapter.FileBrowserAdapter
import com.docreader.app.databinding.ActivityFileBrowserBinding
import com.docreader.app.model.FileItem
import com.docreader.app.util.FileUtils
import com.docreader.app.util.PreferenceManager
import java.io.File
import java.util.*

class FileBrowserActivity : AppCompatActivity() {

    private lateinit var binding: ActivityFileBrowserBinding
    private lateinit var adapter: FileBrowserAdapter
    private lateinit var preferenceManager: PreferenceManager
    
    private var currentPath: File = Environment.getExternalStorageDirectory()
    private val pathStack = Stack<File>()
    private var fileType: String = "all"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFileBrowserBinding.inflate(layoutInflater)
        setContentView(binding.root)

        preferenceManager = PreferenceManager(this)
        fileType = intent.getStringExtra("file_type") ?: "all"

        setupUI()
        loadDirectory(currentPath)
    }

    private fun setupUI() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            title = when (fileType) {
                "html" -> getString(R.string.select_html)
                "pdf" -> getString(R.string.select_pdf)
                else -> getString(R.string.select_document)
            }
        }

        adapter = FileBrowserAdapter(
            onItemClick = { fileItem ->
                if (fileItem.isDirectory) {
                    navigateToDirectory(File(fileItem.path))
                } else {
                    openFile(fileItem)
                }
            }
        )

        binding.recyclerFiles.apply {
            layoutManager = LinearLayoutManager(this@FileBrowserActivity)
            adapter = this@FileBrowserActivity.adapter
        }

        // Quick path buttons
        binding.chipDownload.setOnClickListener {
            navigateToDirectory(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS))
        }
        binding.chipDocuments.setOnClickListener {
            navigateToDirectory(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS))
        }
        binding.chipStorage.setOnClickListener {
            navigateToDirectory(Environment.getExternalStorageDirectory())
        }

        // Navigate up button
        binding.fabBack.setOnClickListener {
            navigateUp()
        }

        // Pull to refresh
        binding.swipeRefresh.setOnRefreshListener {
            loadDirectory(currentPath)
            binding.swipeRefresh.isRefreshing = false
        }
    }

    private fun navigateToDirectory(directory: File) {
        if (directory.exists() && directory.isDirectory) {
            pathStack.push(currentPath)
            currentPath = directory
            loadDirectory(currentPath)
        } else {
            Toast.makeText(this, getString(R.string.cannot_access_directory), Toast.LENGTH_SHORT).show()
        }
    }

    private fun navigateUp() {
        if (pathStack.isNotEmpty()) {
            currentPath = pathStack.pop()
            loadDirectory(currentPath)
        } else {
            val parent = currentPath.parentFile
            if (parent != null && parent.exists() && parent.canRead()) {
                currentPath = parent
                loadDirectory(currentPath)
            } else {
                finish()
            }
        }
    }

    private fun loadDirectory(directory: File) {
        binding.textCurrentPath.text = directory.absolutePath
        
        val files = directory.listFiles()
        if (files == null) {
            binding.layoutEmpty.visibility = View.VISIBLE
            binding.recyclerFiles.visibility = View.GONE
            adapter.submitList(emptyList())
            return
        }

        val fileItems = files
            .filter { file ->
                if (file.isDirectory) {
                    !file.isHidden && file.canRead()
                } else {
                    when (fileType) {
                        "html" -> FileUtils.isHtmlFile(file)
                        "pdf" -> FileUtils.isPdfFile(file)
                        else -> FileUtils.isHtmlFile(file) || FileUtils.isPdfFile(file)
                    }
                }
            }
            .map { FileUtils.fileToFileItem(it) }
            .sortedWith(compareBy({ !it.isDirectory }, { it.name.lowercase() }))

        if (fileItems.isEmpty()) {
            binding.layoutEmpty.visibility = View.VISIBLE
            binding.recyclerFiles.visibility = View.GONE
        } else {
            binding.layoutEmpty.visibility = View.GONE
            binding.recyclerFiles.visibility = View.VISIBLE
        }
        
        adapter.submitList(fileItems)

        // Update back button visibility
        binding.fabBack.visibility = if (currentPath != Environment.getExternalStorageDirectory()) {
            View.VISIBLE
        } else {
            View.GONE
        }
    }

    private fun openFile(fileItem: FileItem) {
        preferenceManager.addRecentFile(fileItem.path)
        
        val intent = when {
            fileItem.isHtml -> Intent(this, HtmlReaderActivity::class.java)
            fileItem.isPdf -> Intent(this, PdfReaderActivity::class.java)
            else -> return
        }
        intent.putExtra("file_path", fileItem.path)
        intent.putExtra("file_name", fileItem.name)
        startActivity(intent)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                navigateUp()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onBackPressed() {
        if (pathStack.isNotEmpty() || currentPath != Environment.getExternalStorageDirectory()) {
            navigateUp()
        } else {
            super.onBackPressed()
        }
    }
}
