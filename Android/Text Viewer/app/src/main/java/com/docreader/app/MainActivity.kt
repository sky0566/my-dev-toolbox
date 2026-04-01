package com.docreader.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.Settings
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.docreader.app.adapter.RecentFileAdapter
import com.docreader.app.databinding.ActivityMainBinding
import com.docreader.app.model.FileItem
import com.docreader.app.util.FileUtils
import com.docreader.app.util.PreferenceManager
import java.io.File

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var recentAdapter: RecentFileAdapter
    private lateinit var preferenceManager: PreferenceManager

    private val storagePermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.entries.all { it.value }
        if (allGranted) {
            loadRecentFiles()
        } else {
            showPermissionDialog()
        }
    }

    private val manageStorageLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (Environment.isExternalStorageManager()) {
                loadRecentFiles()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        preferenceManager = PreferenceManager(this)
        setupUI()
        checkPermissions()
    }

    override fun onResume() {
        super.onResume()
        loadRecentFiles()
    }

    private fun setupUI() {
        // Setup toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = getString(R.string.app_name)

        // Setup recent files list
        recentAdapter = RecentFileAdapter(
            onItemClick = { fileItem ->
                openFile(fileItem)
            },
            onItemRemove = { fileItem ->
                preferenceManager.removeRecentFile(fileItem.path)
                loadRecentFiles()
            }
        )
        binding.recyclerRecentFiles.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = recentAdapter
        }

        // Browse HTML button
        binding.cardBrowseHtml.setOnClickListener {
            openFileBrowser("html")
        }

        // Browse PDF button
        binding.cardBrowsePdf.setOnClickListener {
            openFileBrowser("pdf")
        }

        // Browse all documents button
        binding.cardBrowseAll.setOnClickListener {
            openFileBrowser("all")
        }

        // Pull to refresh
        binding.swipeRefresh.setOnRefreshListener {
            loadRecentFiles()
            binding.swipeRefresh.isRefreshing = false
        }
    }

    private fun checkPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                showManageStoragePermissionDialog()
            } else {
                loadRecentFiles()
            }
        } else {
            val permissions = arrayOf(
                Manifest.permission.READ_EXTERNAL_STORAGE
            )
            val notGranted = permissions.filter {
                ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
            }
            if (notGranted.isNotEmpty()) {
                storagePermissionLauncher.launch(notGranted.toTypedArray())
            } else {
                loadRecentFiles()
            }
        }
    }

    private fun showManageStoragePermissionDialog() {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(getString(R.string.permission_required))
            .setMessage(getString(R.string.storage_permission_message))
            .setPositiveButton(getString(R.string.go_to_settings)) { _, _ ->
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    try {
                        val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION)
                        intent.data = Uri.parse("package:$packageName")
                        manageStorageLauncher.launch(intent)
                    } catch (e: Exception) {
                        val intent = Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION)
                        manageStorageLauncher.launch(intent)
                    }
                }
            }
            .setNegativeButton(getString(R.string.cancel), null)
            .show()
    }

    private fun showPermissionDialog() {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(getString(R.string.permission_denied))
            .setMessage(getString(R.string.permission_denied_message))
            .setPositiveButton(getString(R.string.go_to_settings)) { _, _ ->
                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                intent.data = Uri.fromParts("package", packageName, null)
                startActivity(intent)
            }
            .setNegativeButton(getString(R.string.cancel), null)
            .show()
    }

    private fun loadRecentFiles() {
        val recentPaths = preferenceManager.getRecentFiles()
        val recentFiles = recentPaths.mapNotNull { path ->
            val file = File(path)
            if (file.exists()) {
                FileUtils.fileToFileItem(file)
            } else {
                preferenceManager.removeRecentFile(path)
                null
            }
        }

        if (recentFiles.isEmpty()) {
            binding.layoutEmptyRecent.visibility = View.VISIBLE
            binding.recyclerRecentFiles.visibility = View.GONE
        } else {
            binding.layoutEmptyRecent.visibility = View.GONE
            binding.recyclerRecentFiles.visibility = View.VISIBLE
            recentAdapter.submitList(recentFiles)
        }
    }

    private fun openFileBrowser(fileType: String) {
        val intent = Intent(this, FileBrowserActivity::class.java)
        intent.putExtra("file_type", fileType)
        startActivity(intent)
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
}
