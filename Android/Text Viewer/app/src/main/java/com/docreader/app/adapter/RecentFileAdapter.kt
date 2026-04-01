package com.docreader.app.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.docreader.app.R
import com.docreader.app.databinding.ItemRecentFileBinding
import com.docreader.app.model.FileItem
import com.docreader.app.util.FileUtils
import java.text.SimpleDateFormat
import java.util.*

class RecentFileAdapter(
    private val onItemClick: (FileItem) -> Unit,
    private val onItemRemove: (FileItem) -> Unit
) : ListAdapter<FileItem, RecentFileAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemRecentFileBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(
        private val binding: ItemRecentFileBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: FileItem) {
            binding.textFileName.text = item.name
            binding.textFilePath.text = item.path
            binding.textFileInfo.text = "${FileUtils.formatFileSize(item.size)} · ${formatDate(item.lastModified)}"
            
            // Set file icon
            val iconRes = when {
                item.isHtml -> R.drawable.ic_html
                item.isPdf -> R.drawable.ic_pdf
                else -> R.drawable.ic_file
            }
            binding.imageFileIcon.setImageResource(iconRes)

            binding.root.setOnClickListener {
                onItemClick(item)
            }

            binding.buttonRemove.setOnClickListener {
                onItemRemove(item)
            }
        }

        private fun formatDate(timestamp: Long): String {
            val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
            return sdf.format(Date(timestamp))
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<FileItem>() {
        override fun areItemsTheSame(oldItem: FileItem, newItem: FileItem): Boolean {
            return oldItem.path == newItem.path
        }

        override fun areContentsTheSame(oldItem: FileItem, newItem: FileItem): Boolean {
            return oldItem == newItem
        }
    }
}
