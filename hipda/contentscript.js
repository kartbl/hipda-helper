//恢复全文搜索
function reviveFullSearch(url) {
    //在搜索页面添加全文搜索的选项
    if (url.indexOf('search') > 0) {
        $('#wrap > form > p.searchkey > select').append($('<option>', {
            value: 'fulltext',
            text: '全文'
        }));
    }

    //全文搜索结果页自动选中全文搜索选项
    if (url.indexOf('srchtype=fulltext') > 0) {
        $('#wrap > form > p.searchkey > select').val('fulltext');
    }

}


//屏蔽BS版置顶帖
function removeBSstickthreads(url) {
    if (url.indexOf('fid=6') > 0) {
        $('tbody[id^="stickthread"]').hide()
    }
}


//黑名单屏蔽功能
function block(url, blacklist) {
    //帖子列表页面屏蔽
    if (url.indexOf('fid=') > 0) {
        var authorList = $('.author>cite>a')
        $(authorList).each(function () {
            var userName = $(this).text();
            if (blacklist.indexOf(userName) > 0) {
                $(this).parents('tbody').hide();
            }
        });
    }

    //帖子内容页面屏蔽
    if (url.indexOf('viewthread') > 0) {
        var postList = $('.mainbox>div')
        $(postList).each(function () {
            var userName = $('.postinfo>a', this).text()
            if (blacklist.indexOf(userName) > 0) {
                $(this).hide();
            }
        })
    }
}

//在帖子内容页面id信息栏添加加入黑名单按钮
function addToBlackList(url) {
    if (url.indexOf('viewthread') > 0) {
        $('li.buddy').each(function () {

            var postauthor = $(this).parents('.postauthor');
            var userName = $('.postinfo>a', postauthor).text();
            var listr = "<li style='background-image: url(/forum/images/icons/icon11.gif);'><a href='javascript:void(0)' class='block_it' title='加入黑名单'"
                + "usernamestr=" + userName + ">加黑名单</a></li>"
            $(this).after(listr);
        })

        var formhashstr = $('#umenu > a:nth-child(8)').attr('href').split('formhash=')[1]
        $('.block_it').click(function () {
            var name = $(this).attr('usernamestr');
            var confirm_msg = confirm("您确认将 " + name + " 加入黑名单么？\n刷新页面生效");
            var addblockurl_raw = 'https://www.hi-pda.com/forum/pm.php?action=addblack&formhash=' + formhashstr + '&user=' + name;
            var addblockurl_encoded = GBK.URI.encodeURI(addblockurl_raw);
            if (confirm_msg == true) {
                $.get(addblockurl_encoded, function () {
                    //给background.js发消息,执行重新获取黑名单动作
                    chrome.runtime.sendMessage({ command: 'refresh_blacklist' });
                });

            }
        })
    }
}

//脚本主入口,页面加载时执行
$(function () {
    var urlOfPage = window.location.href;
    reviveFullSearch(urlOfPage);
    removeBSstickthreads(urlOfPage);



    //通过chrome.storage获取黑名单,进行屏蔽功能
    chrome.storage.local.get('blacklist', function (result) {
        // console.log('黑名单数据: ' + result.blacklist);
        block(urlOfPage, result.blacklist);
    });

    //用户手动添加黑名单
    addToBlackList(urlOfPage);


})


