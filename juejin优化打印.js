// ==UserScript==
// @name         稀土掘金文章优化打印
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  优化稀土掘金文章页面用于打印，移除不必要元素并自动调用打印功能，支持导出PDF
// @author       Sherry
// @match        *://juejin.cn/post/*
// @grant        none
// @run-at       document-end
// @icon         https://lf3-cdn-tos.bytescdn.com/obj/static/xitu_juejin_web/static/favicons/favicon-32x32.png
// @license      MIT
// ==/UserScript==

(function(){
    'use strict';
    
    // 创建控制面板
    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'juejin-print-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 9999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            cursor: move;
            width: 150px;
            box-sizing: content-box;
        `;
        
        const title = document.createElement('div');
        title.textContent = '📄 掘金打印优化';
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
            color: #333;
            cursor: move;
        `;
        
        const optimizeBtn = document.createElement('button');
        optimizeBtn.textContent = '🖨️ 优化并打印';
        optimizeBtn.style.cssText = `
            background-color: #1e80ff;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            margin: 5px;
            cursor: pointer;
            width: calc(100% - 10px);
            box-sizing: border-box;
        `;
        optimizeBtn.onclick = function() {
            optimizePage(true);
        };
        
        const savePdfBtn = document.createElement('button');
        savePdfBtn.textContent = '💾 保存为PDF';
        savePdfBtn.style.cssText = `
            background-color: #007acc;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            margin: 5px;
            cursor: pointer;
            width: calc(100% - 10px);
            box-sizing: border-box;
        `;
        savePdfBtn.onclick = function() {
            optimizePage(false, true);
        };
        
        const optimizeOnlyBtn = document.createElement('button');
        optimizeOnlyBtn.textContent = '✨ 仅优化页面';
        optimizeOnlyBtn.style.cssText = `
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            margin: 5px;
            cursor: pointer;
            width: calc(100% - 10px);
            box-sizing: border-box;
        `;
        optimizeOnlyBtn.onclick = function() {
            optimizePage(false, false);
        };
        
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 恢复原页面';
        resetBtn.style.cssText = `
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            margin: 5px;
            cursor: pointer;
            width: calc(100% - 10px);
            box-sizing: border-box;
        `;
        resetBtn.onclick = function() {
            location.reload();
        };
        
        panel.appendChild(title);
        panel.appendChild(optimizeBtn);
        panel.appendChild(savePdfBtn);
        panel.appendChild(optimizeOnlyBtn);
        panel.appendChild(resetBtn);
        
        document.body.appendChild(panel);
        
        // 添加拖拽功能
        makeDraggable(panel);
    }
    
    // 使元素可拖拽
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        element.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // 获取鼠标位置
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // 鼠标移动时调用elementDrag
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            
            // 不应用任何缩放调整，直接使用原始计算
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // 设置元素的新位置
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.right = "auto";
        }
        
        function closeDragElement() {
            // 停止移动
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    // 优化页面函数
    function optimizePage(autoPrint = false, savePdf = false) {
        // 保存原始标题用于PDF文件名
        const articleTitle = document.querySelector('.article-title')?.textContent || document.title;
        
        // 移除不必要元素
        const elementsToRemove = [
            '.article-suspended-panel', // 悬浮面板
            '.main-header-box', // 顶部导航
            '.article-title-box + div', // 作者信息区域
            '.article-end', // 文章结尾区域
            '.article-catalog', // 目录
            '.article-banner', // 广告横幅
            '.recommended-area', // 推荐区域
            '.comment-box', // 评论区
            '.sidebar', // 侧边栏
            '.extension', // 扩展区域
            '.column-container', // 专栏容器
            '.footer-wrapper', // 页脚
            '.main-header', // 主页头部
            '.article-suspended-panel', // 文章悬浮面板
            '.tag-list-box', // 标签列表
            '.category-course-recommend', // 课程推荐
            '.next-article', // 下一篇文章
            '.extension-banner', // 扩展横幅
            '.author-info-block', // 作者信息
            '.recommend-box', // 推荐框
            '.article-title-box + div', // 作者信息下方的分享等按钮
            '.article-title-box .stat-item', // 文章标题下的统计信息
            '.article-title-box .stat-view-times', // 阅读次数
            '.article-title-box .stat-like', // 点赞
            '.article-title-box .stat-comment', // 评论数
            '.article-title-box .follow-btn', // 关注按钮
            '.article-title-box .follow-btn-wrap', // 关注按钮包装
            '.column-entry-list', // 专栏列表
            '.column-entry', // 专栏条目
            '.suspension-panel', // 悬浮面板
            '.suspension-panel.suspension-panel', // 重复选择器确保移除
            '.article-feedback-wrap', // 文章反馈区域
            '.article-feedback', // 文章反馈
            '.author-block', // 作者块
            '.wechat-banner', // 微信横幅
            '.category-course-recommend', // 课程推荐
            '.category-course-box', // 课程盒子
            '.post-recommend-box', // 文章推荐盒子
            '.post-list-box', // 文章列表盒子
            '.app-open-button', // APP打开按钮
            '.open-button', // 打开按钮
            '.app-download-sidebar-block', // APP下载侧边栏
            '.sticky-block', // 粘性块
            '.sticky-block-box', // 粘性块盒子
            '.login-guide-box', // 登录引导盒子
            '.login-button-wrap', // 登录按钮包装
            '.login-banner', // 登录横幅
            '.article-area > div:last-child', // 文章区域最后一个div（通常是推荐或评论）
            '.article-area > div[data-growing-title]', // 带有growing-title属性的div（通常是广告）
            '.advert-box' // 广告盒子
        ];
        
        elementsToRemove.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.remove();
            });
        });
        
        // 修复布局
        const articleArea = document.querySelector('.article-area');
        if (articleArea) {
            articleArea.style.cssText = `
                width: 100% !important;
                max-width: 100% !important;
                padding: 20px !important;
                margin: 0 auto !important;
                float: none !important;
                box-sizing: border-box !important;
            `;
        }
        
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.style.cssText = `
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 auto !important;
            `;
        }
        
        const articleContent = document.querySelector('.article-content');
        if (articleContent) {
            articleContent.style.cssText = `
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 auto !important;
            `;
        }
        
        // 扩展代码块宽度
        document.querySelectorAll('pre, code').forEach(el => {
            el.style.maxWidth = '100%';
            el.style.overflow = 'visible';
            el.style.whiteSpace = 'pre-wrap';
        });
        
        // 优化图片显示
        document.querySelectorAll('.article-content img').forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '10px auto';
            img.style.display = 'block';
            
            // 确保图片在打印时可见
            img.setAttribute('loading', 'eager');
            
            // 添加图片描述作为标题
            const altText = img.getAttribute('alt');
            if (altText && !img.nextElementSibling?.classList.contains('img-caption')) {
                const caption = document.createElement('div');
                caption.className = 'img-caption';
                caption.textContent = altText;
                caption.style.cssText = `
                    text-align: center;
                    color: #666;
                    font-size: 0.9em;
                    margin-bottom: 15px;
                `;
                img.parentNode.insertBefore(caption, img.nextSibling);
            }
        });
        
        // 添加打印样式
        const printStyle = document.createElement('style');
        printStyle.id = 'juejin-print-style';
        printStyle.textContent = `
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-size: 12pt;
                }
                
                .article-title {
                    font-size: 18pt;
                    margin-bottom: 10px;
                    page-break-after: avoid;
                }
                
                .article-content {
                    font-size: 12pt;
                    line-height: 1.5;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid;
                    page-break-inside: avoid;
                }
                
                pre, code, table {
                    page-break-inside: avoid;
                }
                
                img {
                    page-break-inside: avoid;
                    max-width: 100% !important;
                }
                
                a {
                    text-decoration: underline;
                    color: #000;
                }
                
                #juejin-print-panel {
                    display: none !important;
                }
                
                /* 确保代码块在打印时有背景色 */
                pre {
                    background-color: #f6f8fa !important;
                    border: 1px solid #ddd !important;
                    padding: 10px !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* 添加页码 */
                @page {
                    margin: 1cm;
                    @bottom-center {
                        content: "第 " counter(page) " 页，共 " counter(pages) " 页";
                    }
                }
            }
        `;
        document.head.appendChild(printStyle);
        
        // 确保控制面板样式不受页面优化影响
        const panel = document.getElementById('juejin-print-panel');
        if (panel) {
            panel.style.width = '150px';
            panel.style.boxSizing = 'content-box';
            panel.style.fontSize = '14px';
            
            // 重置按钮样式
            const buttons = panel.querySelectorAll('button');
            buttons.forEach(button => {
                button.style.width = 'calc(100% - 10px)';
                button.style.boxSizing = 'border-box';
                button.style.margin = '5px';
                button.style.padding = '5px 10px';
            });
            
            // 重新绑定拖拽事件
            makeDraggable(panel);
        }
        
        // 处理打印或保存PDF
        if (autoPrint || savePdf) {
            // 临时隐藏控制面板
            panel.style.display = 'none';
            
            // 延迟调用打印功能，确保样式已应用
            setTimeout(function() {
                if (savePdf) {
                    // 使用浏览器的打印功能，选择"另存为PDF"
                    const printOptions = {
                        filename: `${articleTitle.replace(/[\\/:*?"<>|]/g, '_')}.pdf`,
                    };
                    window.print();
                    // 注意：由于浏览器安全限制，无法自动选择"另存为PDF"选项，
                    // 用户需要在打印对话框中手动选择"另存为PDF"
                } else if (autoPrint) {
                    window.print();
                }
                
                // 打印完成后显示控制面板
                setTimeout(function() {
                    panel.style.display = 'block';
                }, 1000);
            }, 500);
        }
    }
    
    // 等待页面加载完成后创建控制面板
    setTimeout(function() {
        createControlPanel();
    }, 1500);
})(); 