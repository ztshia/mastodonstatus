let postsData = [];
let currentDisplayCount = 0;
const increment = 30;

document.addEventListener('DOMContentLoaded', () => {
    fetch('./memos.json')
        .then(response => response.json())
        .then(data => {
            postsData = data;
            loadMore();
            window.addEventListener('scroll', handleScroll);
        })
        .catch(error => console.error('Error fetching the JSON data:', error));
});

function showTab(tab) {
    document.querySelector('.tab-button.active').classList.remove('active');
    document.querySelector(`.tab-button[onclick="showTab('${tab}')"]`).classList.add('active');
    document.querySelector('.posts').style.display = tab === 'posts' ? 'block' : 'none';
    document.querySelector('.media').style.display = tab === 'media' ? 'flex' : 'none';
}

function linkifyText(text) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
}

function loadMore() {
    const postsContainer = document.getElementById('posts');
    const mediaContainer = document.getElementById('media');

    const newPosts = postsData.slice(currentDisplayCount, currentDisplayCount + increment);
    newPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const linkedText = linkifyText(post.content);

        // 插入文字内容
        let postHTML = '';
        if (linkedText.trim()) {
            postHTML += `<div class="content">${linkedText}</div>`;
        }

        // 插入图片内容
        if (post.media_attachments.length > 0) {
            postHTML += '<div class="media-container">';
            post.media_attachments.forEach(media => {
                postHTML += `<img src="${media.url}" alt="Media Image">`;
            });
            postHTML += '</div>';
        }

        // 插入日期和来源信息
        postHTML += `
            <div class="date">
                <a href="${post.url}" target="_blank">${moment(post.created_at).fromNow()}</a> 来自<a href="${post.application.website || '#'}" target="_blank"> ${post.application.name}</a>
            </div>
        `;

        postElement.innerHTML = postHTML;
        postsContainer.appendChild(postElement);

        // 在媒体选项卡中添加图片
        post.media_attachments.forEach(media => {
            const mediaElement = document.createElement('a');
            mediaElement.href = media.url;
            mediaElement.target = "_blank";
            mediaElement.innerHTML = `<img src="${media.url}" alt="Media Image">`;
            mediaContainer.appendChild(mediaElement);
        });
    });

    currentDisplayCount += increment;

    if (currentDisplayCount >= postsData.length) {
        document.getElementById('load-more').style.display = 'none';
        window.removeEventListener('scroll', handleScroll);
    }
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadMore();
    }
}
