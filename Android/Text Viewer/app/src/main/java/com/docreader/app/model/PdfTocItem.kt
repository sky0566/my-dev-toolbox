package com.docreader.app.model

data class PdfTocItem(
    val title: String,
    val pageNumber: Int,
    val level: Int = 0
)
