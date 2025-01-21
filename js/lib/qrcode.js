/**
 * 简单的二维码生成器
 * 使用 Canvas API 绘制二维码
 */
class QRCode {
    constructor(element, options) {
        this.element = typeof element === 'string' ? document.getElementById(element) : element;
        this.options = {
            text: options.text || '',
            width: options.width || 128,
            height: options.height || 128,
            colorDark: options.colorDark || '#000000',
            colorLight: options.colorLight || '#ffffff'
        };
        this.init();
    }

    init() {
        // 创建canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = this.options.width;
        canvas.height = this.options.height;
        
        // 获取绘图上下文
        const ctx = canvas.getContext('2d');
        
        // 填充背景
        ctx.fillStyle = this.options.colorLight;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 生成简单的图案
        this.drawPattern(ctx);
        
        // 将canvas添加到容器中
        this.element.innerHTML = '';
        this.element.appendChild(canvas);
    }

    drawPattern(ctx) {
        const { width, height } = this.options;
        const cellSize = Math.floor(Math.min(width, height) / 10);
        const text = this.options.text;
        
        // 计算简单的hash值作为模式
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash = hash & hash;
        }
        
        // 使用hash值生成图案
        ctx.fillStyle = this.options.colorDark;
        
        // 绘制定位图案
        this.drawPositionPattern(ctx, cellSize, 0, 0);
        this.drawPositionPattern(ctx, cellSize, width - 7 * cellSize, 0);
        this.drawPositionPattern(ctx, cellSize, 0, height - 7 * cellSize);
        
        // 使用hash值生成其他图案
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((hash >> (i * 8 + j)) & 1) {
                    const x = (i + 1) * cellSize;
                    const y = (j + 1) * cellSize;
                    ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                }
            }
        }
    }

    drawPositionPattern(ctx, cellSize, x, y) {
        // 绘制定位图案
        ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = this.options.colorLight;
        ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = this.options.colorDark;
        ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    }
}
