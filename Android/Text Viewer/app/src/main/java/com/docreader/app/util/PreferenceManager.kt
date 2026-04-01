package com.docreader.app.util

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray

class PreferenceManager(context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "doc_reader_prefs", Context.MODE_PRIVATE
    )
    
    companion object {
        private const val KEY_RECENT_FILES = "recent_files"
        private const val KEY_FONT_SIZE = "font_size"
        private const val KEY_NIGHT_MODE = "night_mode"
        private const val MAX_RECENT_FILES = 20
    }
    
    fun getRecentFiles(): List<String> {
        val json = prefs.getString(KEY_RECENT_FILES, "[]") ?: "[]"
        return try {
            val array = JSONArray(json)
            (0 until array.length()).map { array.getString(it) }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    fun addRecentFile(path: String) {
        val files = getRecentFiles().toMutableList()
        files.remove(path)
        files.add(0, path)
        
        // Keep maximum of MAX_RECENT_FILES
        while (files.size > MAX_RECENT_FILES) {
            files.removeAt(files.size - 1)
        }
        
        saveRecentFiles(files)
    }
    
    fun removeRecentFile(path: String) {
        val files = getRecentFiles().toMutableList()
        files.remove(path)
        saveRecentFiles(files)
    }
    
    private fun saveRecentFiles(files: List<String>) {
        val array = JSONArray()
        files.forEach { array.put(it) }
        prefs.edit().putString(KEY_RECENT_FILES, array.toString()).apply()
    }
    
    fun getFontSize(): Int {
        return prefs.getInt(KEY_FONT_SIZE, 100)
    }
    
    fun setFontSize(size: Int) {
        prefs.edit().putInt(KEY_FONT_SIZE, size).apply()
    }
    
    fun isNightMode(): Boolean {
        return prefs.getBoolean(KEY_NIGHT_MODE, false)
    }
    
    fun setNightMode(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_NIGHT_MODE, enabled).apply()
    }
}
