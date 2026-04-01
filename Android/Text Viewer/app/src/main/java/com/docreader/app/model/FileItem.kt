package com.docreader.app.model

data class FileItem(
    val name: String,
    val path: String,
    val size: Long,
    val lastModified: Long,
    val isDirectory: Boolean,
    val isHtml: Boolean = false,
    val isPdf: Boolean = false,
    val extension: String = ""
)
