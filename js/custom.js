/* 控制台输出 */
if (window.console) {
    var cons = console;
    if (cons) {
        cons.group("O(∩_∩)O哈喽！");
        cons.log("%c这里是都将会的博客，联系方式：dujianghui_work@163.com", "background-image: linear-gradient(#063053, #395873, #5c7c99);font-size: 2rem;");
        cons.groupEnd();
    }
}

/* 鼠标点击文字特效 */
function randomColor() {
    return `rgb(${~~(255 * Math.random())},${~~(255 * Math.random())},${~~(255 * Math.random())})`;
}

const a = new Array("💖","富强","💜","民主","💙","文明","💚","和谐","💛","自由","🤎","平等","💗","公正","💜","法治","💖","爱国","💚","敬业","💚","诚信","💖","友善");
let a_idx = 0;
let a_click = 1;

$(document).ready(function() {
    $("body").click(function(e) {
        const frequency = 1;
        if (a_click % frequency === 0) {
            const $i = $("<span/>", {
                text: a[a_idx],
                css: {
                    "z-index": 9999,
                    top: e.pageY - 20,
                    left: e.pageX,
                    position: "absolute",
                    "font-weight": "bold",
                    color: randomColor(),
                    "-webkit-user-select": "none",
                    "-moz-user-select": "none",
                    "-ms-user-select": "none",
                    "user-select": "none"
                }
            });
            a_idx = (a_idx + 1) % a.length;
            $("body").append($i);
            $i.animate(
                {
                    top: e.pageY - 180,
                    opacity: 0
                },
                1500,
                function() {
                    $i.remove();
                }
            );
        }
        a_click++;
    });
});

/* 拉姆蕾姆回到顶部或底部按钮 */
$(function () {
    $("#lamu img").eq(0).click(function () {
        $("html,body").animate({scrollTop: $(document).height()}, 800);
        return false;
    });
    $("#leimu img").eq(0).click(function () {
        $("html,body").animate({scrollTop: 0}, 800);
        return false;
    });
});

/* 后置加载页面组件的背景图片 */
$(function () {
    /* 首页头像div加载GitHub Chart作为背景图片 */
    $("div.home-avatar").attr('style', "background: url(https://cdn.jsdelivr.net/gh/hihihiman/hihihiman@output/github-contribution-grid-snake.svg);background-repeat: no-repeat;background-position: center;background-size: auto 10rem;");

    /* 评论框加载背景图片 */
    $(".v[data-class=v] .veditor").attr('style', "background-image: url(" + $cdnPrefix + "/images/common/valinebg.webp) !important;");
});

function getCurrentDateString() {
    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    return "" + now.getFullYear() + (month < 10 ? "0" + month : month) + (day < 10 ? "0" + day : day) + (hour < 10 ? "0" + hour : hour);
}

/* 离开当前页面时修改网页标题，回到当前页面时恢复原来标题 */
window.onload = function () {
    var OriginTitile = document.title;
    var titleTime;
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            $('[rel="icon"]').attr('href', "/failure.ico");
            $('[rel="shortcut icon"]').attr('href', "/failure.ico");
            document.title = '喔唷，人呢！';
            clearTimeout(titleTime);
        } else {
            $('[rel="icon"]').attr('href', "/favicon-32x32.png");
            $('[rel="shortcut icon"]').attr('href', "/favicon-32x32.png");
            document.title = '咦，欢迎回来！';
            titleTime = setTimeout(function () {
                document.title = OriginTitile;
            }, 2000);
        }
    });
}

runtime();
