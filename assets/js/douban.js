document.addEventListener("DOMContentLoaded", function() {
    const url = 'https://git.upstairs.cn/ztshia/douban/main/data/douban/movie.json';
    const movieList = document.getElementById('movies');
    let data = [];
    let currentIndex = 0;
    const itemsPerPage = 30;
    const initialLoad = 60;

    function loadMovies(startIndex, count) {
        const endIndex = startIndex + count;
        for (let i = startIndex; i < endIndex && i < data.length; i++) {
            const item = data[i];
            const movie = item.subject;

            if (!movie || !movie.pic || !movie.pic.normal || !item.rating) {
                console.warn(`Skipping movie at index ${i} due to missing necessary information.`);
                continue;
            }

            const originalUrl = new URL(movie.cover_url);
            const newCoverUrl = `https://view.upstairs.cn${originalUrl.pathname}!small`;
            const myRatingStars = '🌟'.repeat(Math.floor(item.rating.value));
            const createDate = moment(item.create_time).twitter();

            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');
            movieElement.setAttribute('data-comment', item.comment);
            movieElement.setAttribute('data-title', movie.title);
            movieElement.setAttribute('data-my-rating', myRatingStars);
            movieElement.setAttribute('data-date', createDate);
            movieElement.setAttribute('data-year', movie.year);

            movieElement.innerHTML = `
                <img src="${newCoverUrl}" alt="${movie.title}">
            `;

            movieList.appendChild(movieElement);
        }
        currentIndex += count;
        observeLastMovie();
    }

    function observeLastMovie() {
        const movies = document.querySelectorAll('.movie');
        const lastMovie = movies[movies.length - 1];

        if (lastMovie) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    observer.disconnect();
                    loadMovies(currentIndex, itemsPerPage);
                }
            });

            observer.observe(lastMovie);
        }
    }

    fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            loadMovies(currentIndex, initialLoad);
        })
        .catch(error => console.error('Error loading movie data:', error));
});