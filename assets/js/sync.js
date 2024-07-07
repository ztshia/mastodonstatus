async function fetchMemos() {
    const response = await fetch('https://life.upstairs.cn/api/memo?creatorId=101&limit=108');
    const data = await response.json();
    return data.data;
}

function getRandomImage(resourceList) {
    if (resourceList && resourceList.length > 0) {
        const randomIndex = Math.floor(Math.random() * resourceList.length);
        let externalLink = resourceList[randomIndex].externalLink;
        externalLink = externalLink.replace('one.upstairs.cn', '365.upstairs.cn') + '65thumb';
        return externalLink;
    }
    return null;
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

function createMemoItem(memo) {
    const imageUrl = getRandomImage(memo.resourceList);
    if (!imageUrl) return null;

    const li = document.createElement('li');
    li.style.backgroundImage = `url(${imageUrl})`;

    const memoText = document.createElement('div');
    memoText.classList.add('memo-text');
    memoText.textContent = truncateText(memo.content, 60);

    const memoTimestamp = document.createElement('div');
    memoTimestamp.classList.add('memo-timestamp');
    memoTimestamp.textContent = moment(memo.createdTs * 1000).twitter();

    li.appendChild(memoText);
    li.appendChild(memoTimestamp);

    return li;
}

async function renderMemos() {
    const memoList = document.querySelector('#memo-list');
    const memoData = await fetchMemos();
    memoData.forEach(memo => {
        const memoItem = createMemoItem(memo);
        if (memoItem) {
            memoList.appendChild(memoItem);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderMemos();
});