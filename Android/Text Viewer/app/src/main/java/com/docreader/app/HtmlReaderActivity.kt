package com.docreader.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.SeekBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.docreader.app.adapter.TocAdapter
import com.docreader.app.databinding.ActivityHtmlReaderBinding
import com.docreader.app.model.TocItem
import com.docreader.app.util.PreferenceManager
import java.io.File

class HtmlReaderActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHtmlReaderBinding
    private lateinit var preferenceManager: PreferenceManager
    private lateinit var tocAdapter: TocAdapter
    
    private var filePath: String = ""
    private var fileName: String = ""
    private var tocItems = mutableListOf<TocItem>()
    private var currentFontSize: Int = 100

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHtmlReaderBinding.inflate(layoutInflater)
        setContentView(binding.root)

        preferenceManager = PreferenceManager(this)
        filePath = intent.getStringExtra("file_path") ?: ""
        fileName = intent.getStringExtra("file_name") ?: "HTML Document"
        currentFontSize = preferenceManager.getFontSize()

        setupUI()
        loadHtmlFile()
    }

    private fun setupUI() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            title = fileName
        }

        // Setup TOC adapter
        tocAdapter = TocAdapter { tocItem ->
            scrollToAnchor(tocItem.anchor)
            binding.drawerLayout.closeDrawer(GravityCompat.END)
        }
        binding.recyclerToc.apply {
            layoutManager = LinearLayoutManager(this@HtmlReaderActivity)
            adapter = tocAdapter
        }

        // Setup WebView
        setupWebView()

        // Font size adjustment
        binding.seekbarFontSize.progress = currentFontSize - 50
        binding.seekbarFontSize.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                currentFontSize = progress + 50
                binding.textFontSizeValue.text = "$currentFontSize%"
                applyFontSize()
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                preferenceManager.setFontSize(currentFontSize)
            }
        })
        binding.textFontSizeValue.text = "$currentFontSize%"

        // Night mode toggle
        binding.switchNightMode.isChecked = preferenceManager.isNightMode()
        binding.switchNightMode.setOnCheckedChangeListener { _, isChecked ->
            preferenceManager.setNightMode(isChecked)
            applyNightMode()
        }

        // Tap to toggle toolbar
        binding.webView.setOnClickListener {
            toggleToolbar()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webView.apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                builtInZoomControls = true
                displayZoomControls = false
                useWideViewPort = true
                loadWithOverviewMode = true
                textZoom = currentFontSize
                cacheMode = WebSettings.LOAD_NO_CACHE
            }
            
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    binding.progressBar.visibility = View.GONE
                    extractTableOfContents()
                    applyNightMode()
                }
            }
            
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    binding.progressBar.progress = newProgress
                }
            }
        }
    }

    private fun loadHtmlFile() {
        val file = File(filePath)
        if (!file.exists()) {
            Toast.makeText(this, getString(R.string.file_not_found), Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.webView.loadUrl("file://$filePath")
    }

    private fun extractTableOfContents() {
        // Extract headings from HTML as table of contents
        val js = """
            (function() {
                var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                var toc = [];
                for (var i = 0; i < headings.length; i++) {
                    var h = headings[i];
                    var id = h.id || 'toc_' + i;
                    h.id = id;
                    toc.push({
                        level: parseInt(h.tagName.charAt(1)),
                        title: h.innerText.trim().substring(0, 100),
                        anchor: id
                    });
                }
                return JSON.stringify(toc);
            })();
        """.trimIndent()

        binding.webView.evaluateJavascript(js) { result ->
            try {
                val jsonStr = result.trim('"').replace("\\\"", "\"").replace("\\\\", "\\")
                if (jsonStr.isNotEmpty() && jsonStr != "null") {
                    val items = parseTocJson(jsonStr)
                    tocItems.clear()
                    tocItems.addAll(items)
                    tocAdapter.submitList(tocItems.toList())
                    
                    if (tocItems.isNotEmpty()) {
                        binding.fabToc.visibility = View.VISIBLE
                        binding.fabToc.setOnClickListener {
                            binding.drawerLayout.openDrawer(GravityCompat.END)
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun parseTocJson(json: String): List<TocItem> {
        val items = mutableListOf<TocItem>()
        try {
            val org = org.json.JSONArray(json)
            for (i in 0 until org.length()) {
                val obj = org.getJSONObject(i)
                items.add(TocItem(
                    level = obj.getInt("level"),
                    title = obj.getString("title"),
                    anchor = obj.getString("anchor")
                ))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return items
    }

    private fun scrollToAnchor(anchor: String) {
        binding.webView.evaluateJavascript(
            "document.getElementById('$anchor')?.scrollIntoView({behavior: 'smooth', block: 'start'});",
            null
        )
    }

    private fun applyFontSize() {
        binding.webView.settings.textZoom = currentFontSize
    }

    private fun applyNightMode() {
        val isNight = preferenceManager.isNightMode()
        val css = if (isNight) {
            """
                body { 
                    background-color: #1a1a1a !important; 
                    color: #e0e0e0 !important; 
                }
                * { 
                    background-color: transparent !important;
                    color: #e0e0e0 !important; 
                    border-color: #333 !important;
                }
                a { color: #6db3f2 !important; }
                img { opacity: 0.8; }
                pre, code { 
                    background-color: #2d2d2d !important; 
                    color: #f8f8f2 !important;
                }
            """
        } else {
            """
                body { 
                    background-color: #fafafa !important; 
                    color: #333 !important; 
                }
            """
        }
        
        val js = """
            (function() {
                var style = document.getElementById('docreader-night-style');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'docreader-night-style';
                    document.head.appendChild(style);
                }
                style.textContent = `$css`;
            })();
        """.trimIndent()
        
        binding.webView.evaluateJavascript(js, null)
    }

    private fun toggleToolbar() {
        if (binding.appBarLayout.visibility == View.VISIBLE) {
            binding.appBarLayout.visibility = View.GONE
            binding.layoutSettings.visibility = View.GONE
        } else {
            binding.appBarLayout.visibility = View.VISIBLE
        }
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
                    Toast.makeText(this, getString(R.string.no_toc), Toast.LENGTH_SHORT).show()
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
            binding.webView.canGoBack() -> {
                binding.webView.goBack()
            }
            else -> super.onBackPressed()
        }
    }

    override fun onDestroy() {
        binding.webView.destroy()
        super.onDestroy()
    }
}
