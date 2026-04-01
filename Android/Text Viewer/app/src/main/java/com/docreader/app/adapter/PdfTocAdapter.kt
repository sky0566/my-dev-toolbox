package com.docreader.app.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.docreader.app.databinding.ItemPdfTocBinding
import com.docreader.app.model.PdfTocItem

class PdfTocAdapter(
    private val onItemClick: (PdfTocItem) -> Unit
) : ListAdapter<PdfTocItem, PdfTocAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemPdfTocBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(
        private val binding: ItemPdfTocBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: PdfTocItem) {
            binding.textTocTitle.text = item.title
            binding.textPageNumber.text = "Page ${item.pageNumber + 1}"
            
            // Set indentation based on level
            val padding = item.level * 24
            binding.root.setPadding(
                padding + 16,
                binding.root.paddingTop,
                binding.root.paddingRight,
                binding.root.paddingBottom
            )
            
            // Set font size based on level
            val textSize = when (item.level) {
                0 -> 17f
                1 -> 15f
                else -> 14f
            }
            binding.textTocTitle.textSize = textSize

            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<PdfTocItem>() {
        override fun areItemsTheSame(oldItem: PdfTocItem, newItem: PdfTocItem): Boolean {
            return oldItem.title == newItem.title && oldItem.pageNumber == newItem.pageNumber
        }

        override fun areContentsTheSame(oldItem: PdfTocItem, newItem: PdfTocItem): Boolean {
            return oldItem == newItem
        }
    }
}
