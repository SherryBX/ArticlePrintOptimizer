// ==UserScript==
// @name         文章优化打印合集
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  优化CSDN、稀土掘金和知乎专栏文章页面用于打印，移除不必要元素并自动调用打印功能，支持导出PDF
// @author       Sherry
// @match        *://*.csdn.net/*/article/details/*
// @match        *://juejin.cn/post/*
// @match        *://zhuanlan.zhihu.com/p/*
// @grant        none
// @run-at       document-end
// @icon         https://tse1-mm.cn.bing.net/th/id/OIP-C.3iWufqIms_ccabhKcsM4GgHaHa?w=180&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7
// @license      MIT
// @homepage     https://github.com/sherrys2025/ArticlePrintOptimizer
// @supportURL   https://github.com/sherrys2025/ArticlePrintOptimizer/issues
// ==/UserScript==

(function(){
    'use strict';
    
    // 判断当前网站
    const isCSND = location.hostname.includes('csdn.net');
    const isJuejin = location.hostname.includes('juejin.cn');
    const isZhihu = location.hostname.includes('zhuanlan.zhihu.com');
    
    // 网站相关配置 - 统一使用蓝色主题
    const siteConfig = {
        csdn: {
            name: 'CSDN',
            color: '#1890ff',
            icon: '📄'
        },
        juejin: {
            name: '掘金',
            color: '#1890ff',
            icon: '📄'
        },
        zhihu: {
            name: '知乎',
            color: '#1890ff',
            icon: '📄'
        }
    };
    
    // 当前网站配置
    let currentSite;
    if (isCSND) {
        currentSite = siteConfig.csdn;
    } else if (isJuejin) {
        currentSite = siteConfig.juejin;
    } else if (isZhihu) {
        currentSite = siteConfig.zhihu;
    }
    
    // 创建控制面板
    function createControlPanel() {
        // 添加字体
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
        
        // 添加全局样式
        const globalStyle = document.createElement('style');
        globalStyle.textContent = `
            #article-print-panel * {
                box-sizing: border-box !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
            }
            
            @keyframes ripple-effect {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(globalStyle);
        
        // 创建面板容器
        const panel = document.createElement('div');
        panel.id = 'article-print-panel';
        panel.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background-color: #fff !important;
            border-radius: 8px !important;
            box-shadow: 0 6px 16px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1) !important;
            z-index: 9999 !important;
            font-size: 14px !important;
            cursor: move !important;
            width: 240px !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            transition: all 0.3s ease !important;
            border: 1px solid rgba(0,0,0,0.06) !important;
        `;
        
        // 创建标题栏
        const titleBar = document.createElement('div');
        titleBar.style.cssText = `
            background: #1890ff !important;
            color: white !important;
            padding: 14px 16px !important;
            font-weight: 500 !important;
            font-size: 16px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            border-top-left-radius: 8px !important;
            border-top-right-radius: 8px !important;
            cursor: move !important;
            user-select: none !important;
        `;
        
        const titleText = document.createElement('div');
        titleText.innerHTML = `${currentSite.icon} ${currentSite.name}打印优化`;
        titleText.style.cssText = `
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        `;
        
        // 添加关闭按钮
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            cursor: pointer !important;
            font-size: 14px !important;
            opacity: 0.8 !important;
            transition: all 0.2s !important;
            width: 24px !important;
            height: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 50% !important;
        `;
        closeBtn.onmouseover = function() {
            this.style.opacity = '1';
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        };
        closeBtn.onmouseout = function() {
            this.style.opacity = '0.8';
            this.style.background = 'transparent';
        };
        closeBtn.onclick = function(e) {
            e.stopPropagation();
            panel.style.display = 'none';
            
            // 添加恢复按钮
            const restoreBtn = document.createElement('div');
            restoreBtn.innerHTML = `${currentSite.icon}`;
            restoreBtn.title = '显示打印面板';
            restoreBtn.style.cssText = `
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                background-color: #1890ff !important;
                color: white !important;
                width: 48px !important;
                height: 48px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                box-shadow: 0 6px 16px rgba(0,0,0,0.15) !important;
                font-size: 20px !important;
                z-index: 9999 !important;
                transition: all 0.2s !important;
            `;
            restoreBtn.onmouseover = function() {
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
            };
            restoreBtn.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            };
            restoreBtn.onclick = function() {
                panel.style.display = 'block';
                this.remove();
            };
            document.body.appendChild(restoreBtn);
        };
        
        titleBar.appendChild(titleText);
        titleBar.appendChild(closeBtn);
        
        // 创建按钮容器
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            padding: 20px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 14px !important;
        `;
        
        // 创建按钮函数
        function createButton(icon, text, bgColor, onClick) {
            const buttonWrapper = document.createElement('div');
            buttonWrapper.style.cssText = `
                width: 100% !important;
                height: 44px !important;
                position: relative !important;
            `;
            
            const button = document.createElement('button');
            button.style.cssText = `
                background-color: ${bgColor} !important;
                color: white !important;
                border: none !important;
                border-radius: 6px !important;
                cursor: pointer !important;
                width: 100% !important;
                height: 100% !important;
                font-size: 15px !important;
                font-weight: 500 !important;
                transition: all 0.2s !important;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
                position: relative !important;
                overflow: hidden !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            `;
            
            const iconSpan = document.createElement('span');
            iconSpan.className = 'icon';
            iconSpan.innerHTML = icon;
            iconSpan.style.cssText = `
                display: inline-block !important;
                width: 20px !important;
                margin-right: 10px !important;
                text-align: center !important;
            `;
            
            const textSpan = document.createElement('span');
            textSpan.className = 'text';
            textSpan.textContent = text;
            textSpan.style.cssText = `
                display: inline-block !important;
            `;
            
            button.appendChild(iconSpan);
            button.appendChild(textSpan);
            
            // 添加涟漪效果
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute !important;
                    background: rgba(255, 255, 255, 0.3) !important;
                    border-radius: 50% !important;
                    pointer-events: none !important;
                    transform: translate(-50%, -50%) !important;
                    animation: ripple-effect 0.6s linear !important;
                `;
                
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 2;
                ripple.style.width = ripple.style.height = `${size}px`;
                
                ripple.style.left = `${e.clientX - rect.left}px`;
                ripple.style.top = `${e.clientY - rect.top}px`;
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
                
                onClick();
            });
            
            button.onmouseover = function() {
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                this.style.opacity = '0.9';
            };
            
            button.onmouseout = function() {
                this.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                this.style.opacity = '1';
            };
            
            buttonWrapper.appendChild(button);
            return buttonWrapper;
        }
        
        // 创建优化并打印按钮
        const optimizeBtn = createButton('🖨️', '优化并打印', '#1890ff', function() {
            optimizePage(true);
        });
        
        // 创建保存为PDF按钮
        const savePdfBtn = createButton('💾', '保存为PDF', '#1890ff', function() {
            optimizePage(false, true);
        });
        
        // 创建仅优化页面按钮
        const optimizeOnlyBtn = createButton('✨', '仅优化页面', '#52c41a', function() {
            optimizePage(false);
        });
        
        // 创建恢复原页面按钮
        const resetBtn = createButton('🔄', '恢复原页面', '#ff4d4f', function() {
            location.reload();
        });
        
        // 添加按钮到容器
        buttonsContainer.appendChild(optimizeBtn);
        buttonsContainer.appendChild(savePdfBtn);
        buttonsContainer.appendChild(optimizeOnlyBtn);
        buttonsContainer.appendChild(resetBtn);
        
        // 添加版权信息
        const footer = document.createElement('div');
        footer.textContent = '文章优化打印合集 v3.0';
        footer.style.cssText = `
            text-align: center !important;
            font-size: 12px !important;
            color: rgba(0, 0, 0, 0.45) !important;
            padding: 0 20px 16px !important;
        `;
        
        // 组装面板
        panel.appendChild(titleBar);
        panel.appendChild(buttonsContainer);
        panel.appendChild(footer);
        
        document.body.appendChild(panel);
        
        // 添加拖拽功能
        makeDraggable(panel, titleBar);
    }
    
    // 辅助函数：调整颜色亮度
    function adjustColor(hex, percent) {
        // 将十六进制颜色转换为RGB
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        
        // 调整亮度
        r = Math.min(255, Math.max(0, r + percent));
        g = Math.min(255, Math.max(0, g + percent));
        b = Math.min(255, Math.max(0, b + percent));
        
        // 转换回十六进制
        const rHex = r.toString(16).padStart(2, '0');
        const gHex = g.toString(16).padStart(2, '0');
        const bHex = b.toString(16).padStart(2, '0');
        
        return `#${rHex}${gHex}${bHex}`;
    }
    
    // 使元素可拖拽
    function makeDraggable(element, handle = null) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const dragHandle = handle || element;
        
        dragHandle.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // 获取鼠标位置
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // 鼠标移动时调用elementDrag
            document.onmousemove = elementDrag;
            
            // 添加拖动时的视觉效果
            element.style.opacity = '0.9';
            element.style.transition = 'none';
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
            
            // 恢复视觉效果
            element.style.opacity = '1';
            element.style.transition = 'all 0.3s ease';
        }
    }
    
    // 优化CSDN页面
    function optimizeCSDNPage(autoPrint = false, savePdf = false) {
        // 保存原始标题用于PDF文件名
        const articleTitle = document.title.replace(' - CSDN', '');
        
        // 移除不必要元素
        var articleBox = $("div.article_content");
        articleBox.removeAttr("style");
        $(".hide-preCode-bt").parents(".author-pjw").show();
        $(".hide-preCode-bt").parents("pre").removeClass("set-code-hide");
        $(".hide-preCode-bt").parents(".hide-preCode-box").hide().remove();
        $("#btn-readmore").parent().remove();
        $("#side").remove();
        $(".csdn-side-toolbar, .template-box, .blog-footer-bottom, .left-toolbox, .toolbar-inside").remove();
        $(".comment-box, .recommend-box, .more-toolbox, .article-info-box, .column-group-item").remove();
        $("aside, .tool-box, .recommend-nps-box, .skill-tree-box").remove();
        
        // 修复布局
        $("main").css({
            'display': 'block',
            'float': 'none',
            'margin': '0 auto',
            'padding': '20px'
        });
        
        $("#mainBox").width("100%");
        
        // 修复可能导致第一页空白的问题
        $("body").css({
            'margin': '0',
            'padding': '0',
            'zoom': '0.8',
            'overflow': 'visible'
        });
        
        // 确保文章内容从第一页开始
        $("article").css({
            'page-break-before': 'avoid',
            'margin-top': '0'
        });
        
        // 移除可能导致空白页的元素
        $(".first-page-break").remove();
        
        // 添加打印样式
        const printStyle = document.createElement('style');
        printStyle.id = 'csdn-print-style';
        printStyle.textContent = `
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-size: 12pt;
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
                
                #article-print-panel {
                    display: none !important;
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
        
        handlePrintOrSave(autoPrint, savePdf, articleTitle);
    }
    
    // 优化掘金页面
    function optimizeJuejinPage(autoPrint = false, savePdf = false) {
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
                
                #article-print-panel {
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
        
        handlePrintOrSave(autoPrint, savePdf, articleTitle);
    }
    
    // 优化知乎专栏页面
    function optimizeZhihuPage(autoPrint = false, savePdf = false) {
        // 保存原始标题用于PDF文件名
        const articleTitle = document.querySelector('h1.Post-Title')?.textContent || 
                            document.querySelector('.title-image')?.textContent ||
                            document.title;
        
        // 移除不必要元素 - 简化为只删除指定元素
        const elementsToRemove = [
            'header', // 顶部横幅
            'div.Card.AuthorCard', // 作者卡片
            'div.Comments-container.css-plbgu', // 评论容器
            'div.Post-Sub.Post-NormalSub' // 底部相关信息
        ];
        
        elementsToRemove.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.remove();
            });
        });
        
        // 优化文章容器
        // 查找文章主体内容容器
        let articleContainer = document.querySelector('.Post-RichTextContainer') || 
                              document.querySelector('.RichContent-inner') || 
                              document.querySelector('.Post-RichText');
                              
        if (articleContainer) {
            articleContainer.style.cssText = `
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 20px !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
            `;
        }
        
        // 调整文章容器
        const postMain = document.querySelector('.Post-Main') || 
                         document.querySelector('.Post-NormalMain');
        if (postMain) {
            postMain.style.cssText = `
                width: 100% !important;
                max-width: 100% !important;
                padding: 20px !important;
                margin: 0 auto !important;
            `;
        }
        
        // 优化图片显示
        const imageSelectors = ['.RichText img', '.RichContent-inner img', '.Post-RichText img', '.content img'];
        imageSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(img => {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.margin = '10px auto';
                img.style.display = 'block';
                img.setAttribute('loading', 'eager'); // 确保图片在打印时可见
            });
        });
        
        // 添加打印样式
        const printStyle = document.createElement('style');
        printStyle.id = 'zhihu-print-style';
        printStyle.textContent = `
            @media print {
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    font-size: 12pt !important;
                }
                
                .Post-Title, .ArticleHeader-title {
                    font-size: 18pt !important;
                    margin-bottom: 10px !important;
                    page-break-after: avoid !important;
                    text-align: center !important;
                }
                
                .RichText, .RichContent-inner {
                    font-size: 12pt !important;
                    line-height: 1.5 !important;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid !important;
                    page-break-inside: avoid !important;
                }
                
                pre, code, table, .highlight {
                    page-break-inside: avoid !important;
                    white-space: pre-wrap !important;
                    word-break: break-word !important;
                }
                
                img {
                    page-break-inside: avoid !important;
                    max-width: 100% !important;
                    height: auto !important;
                }
                
                a {
                    text-decoration: underline !important;
                    color: #000 !important;
                }
                
                #article-print-panel {
                    display: none !important;
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
        
        // 显示成功消息
        console.log('知乎文章优化完成，准备打印或保存为PDF');
        
        handlePrintOrSave(autoPrint, savePdf, articleTitle);
    }
    
    // 处理打印或保存PDF
    function handlePrintOrSave(autoPrint = false, savePdf = false, articleTitle = '') {
        // 确保控制面板样式不受页面优化影响
        const panel = document.getElementById('article-print-panel');
        if (panel) {
            // 临时隐藏控制面板
            if (autoPrint || savePdf) {
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
    }
    
    // 根据网站选择优化方法
    function optimizePage(autoPrint = false, savePdf = false) {
        if (isCSND) {
            optimizeCSDNPage(autoPrint, savePdf);
        } else if (isJuejin) {
            optimizeJuejinPage(autoPrint, savePdf);
        } else if (isZhihu) {
            optimizeZhihuPage(autoPrint, savePdf);
        }
    }
    
    // 等待页面加载完成后创建控制面板
    setTimeout(function() {
        createControlPanel();
    }, 1500);
})(); 