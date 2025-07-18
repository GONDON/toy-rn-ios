package com.talenpal.talenpalapp.view

import android.content.Context
import android.graphics.Color
import android.text.SpannableString
import android.text.SpannableStringBuilder
import android.text.TextPaint
import android.text.method.LinkMovementMethod
import android.text.style.ClickableSpan
import android.util.AttributeSet
import android.view.View
import androidx.appcompat.widget.AppCompatTextView
import com.talenpal.talenpalapp.R

class ClickableTextView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatTextView(context, attrs, defStyleAttr) {

    init {
        movementMethod = LinkMovementMethod.getInstance()
        highlightColor = Color.TRANSPARENT // 移除点击背景色
    }

    /**
     * 设置混合文本（普通文本 + 可点击文本）
     * @param normalText 普通文本
     * @param clickableTexts 可点击文本列表，每个元素包含文本和点击回调
     * @param clickableColor 可点击文本颜色（资源ID）
     */
    fun setMixedText(
        normalText: String,
        clickableTexts: List<ClickableText>,
        clickableColor: Int = R.color.colorBlue // 默认蓝色
    ) {
        val builder = SpannableStringBuilder(normalText)

        clickableTexts.forEach { clickable ->
            val start = builder.length
            builder.append(clickable.text)
            val end = builder.length

            val span = object : ClickableSpan() {
                override fun onClick(widget: View) {
                    clickable.onClick()
                }

                override fun updateDrawState(ds: TextPaint) {
                    ds.color = context.getColor(clickableColor)
                    ds.isUnderlineText = false
                }
            }

            builder.setSpan(span, start, end, SpannableString.SPAN_EXCLUSIVE_EXCLUSIVE)
        }

        text = builder
    }


    fun setMixedParts(vararg parts: Any) {
        val builder = SpannableStringBuilder()

        parts.forEach { part ->
            when (part) {
                is String -> builder.append(part)
                is ClickableText -> {
                    val start = builder.length
                    builder.append(part.text)
                    val end = builder.length

                    val span = createClickableSpan(part.onClick)
                    builder.setSpan(span, start, end, SpannableString.SPAN_EXCLUSIVE_EXCLUSIVE)
                }
            }
        }

        text = builder
    }

    private fun createClickableSpan(onClick: () -> Unit): ClickableSpan {
        return object : ClickableSpan() {
            override fun onClick(widget: View) = onClick()
            override fun updateDrawState(ds: TextPaint) {
                ds.color = context.getColor(R.color.colorBlue)
                ds.isUnderlineText = false
            }
        }
    }

    /**
     * 可点击文本数据类
     * @property text 可点击的文本内容
     * @property onClick 点击回调函数
     */
    data class ClickableText(val text: String, val onClick: () -> Unit)
}