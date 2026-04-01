package com.docreader.app.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.docreader.app.R
import com.docreader.app.databinding.ItemFileBrowserBinding
import com.docreader.app.model.FileItem
import com.docreader.app.util.FileUtils
import java.text.SimpleDateFormat
import java.util.*

class FileBrowserAdapter(
    private val onItemClick: (FileItem) -> Unit
) : ListAdapter<FileItem, FileBrowserAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemFileBrowserBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(
        private val binding: ItemFileBrowserBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: FileItem) {
            binding.textFileName.text = item.name
            
            if (item.isDirectory) {
                binding.textFileInfo.text = itemView.context.getString(R.string.folder)
                binding.imageFileIcon.setImageResource(R.drawable.ic_folder)
            } else {
                binding.textFileInfo.text = "${FileUtils.formatFileSize(item.size)} · ${formatDate(item.lastModified)}"
                val iconRes = when {
                    item.isHtml -> R.drawable.ic_html
                    item.isPdf -> R.drawable.ic_pdf
                    else -> R.drawable.ic_file
                }
                binding.imageFileIcon.setImageResource(iconRes)
            }

            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }

        private fun formatDate(timestamp: Long): String {
            val sdf = SimpleDateFormat("MM-dd HH:mm", Locale.getDefault())
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
