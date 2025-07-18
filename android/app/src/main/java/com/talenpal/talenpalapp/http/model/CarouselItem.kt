package com.talenpal.talenpalapp.http.model

sealed class CarouselItem {
    data class ImageItem(val url: String) : CarouselItem()
    data class VideoItem(val url: String, val thumbnail: String) : CarouselItem()
    data class AudioItem(val url: String, val cover: String) : CarouselItem()
}