package com.docreader.app.util

import com.docreader.app.model.FileItem
import java.io.File
import java.text.DecimalFormat

object FileUtils {
    
    private val htmlExtensions = setOf("html", "htm", "xhtml", "mhtml")
    private val pdfExtensions = setOf("pdf")
    
    fun isHtmlFile(file: File): Boolean {
        val ext = file.extension.lowercase()
        return ext in htmlExtensions
    }
    
    fun isPdfFile(file: File): Boolean {
        val ext = file.extension.lowercase()
        return ext in pdfExtensions
    }
    
    fun isSupportedFile(file: File): Boolean {
        return isHtmlFile(file) || isPdfFile(file)
    }
    
    fun fileToFileItem(file: File): FileItem {
        return FileItem(
            name = file.name,
            path = file.absolutePath,
            size = if (file.isDirectory) 0 else file.length(),
            lastModified = file.lastModified(),
            isDirectory = file.isDirectory,
            isHtml = isHtmlFile(file),
            isPdf = isPdfFile(file),
            extension = file.extension.lowercase()
        )
    }
    
    fun formatFileSize(size: Long): String {
        if (size <= 0) return "0 B"
        val units = arrayOf("B", "KB", "MB", "GB", "TB")
        val digitGroups = (Math.log10(size.toDouble()) / Math.log10(1024.0)).toInt()
        val df = DecimalFormat("#,##0.#")
        return df.format(size / Math.pow(1024.0, digitGroups.toDouble())) + " " + units[digitGroups]
    }
    
    fun getFileTypeDescription(file: File): String {
        return when {
            file.isDirectory -> "Folder"
            isHtmlFile(file) -> "HTML Document"
            isPdfFile(file) -> "PDF Document"
            else -> "File"
        }
    }
}
