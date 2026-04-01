package com.docreader.app.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.docreader.app.databinding.ItemTocBinding
import com.docreader.app.model.TocItem

class TocAdapter(
    private val onItemClick: (TocItem) -> Unit
) : ListAdapter<TocItem, TocAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemTocBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(
        private val binding: ItemTocBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: TocItem) {
            binding.textTocTitle.text = item.title
            
            // Set indentation based on heading level
            val padding = (item.level - 1) * 24
            binding.root.setPadding(
                padding + 16,
                binding.root.paddingTop,
                binding.root.paddingRight,
                binding.root.paddingBottom
            )
            
            // Set font size based on level
            val textSize = when (item.level) {
                1 -> 18f
                2 -> 16f
                3 -> 15f
                else -> 14f
            }
            binding.textTocTitle.textSize = textSize

            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<TocItem>() {
        override fun areItemsTheSame(oldItem: TocItem, newItem: TocItem): Boolean {
            return oldItem.anchor == newItem.anchor
        }

        override fun areContentsTheSame(oldItem: TocItem, newItem: TocItem): Boolean {
            return oldItem == newItem
        }
    }
}
