const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const playlist = $('.playlist');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

var isDarkMode = false;

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig : function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: 'Ấn nút thả giấc mơ',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/AnNutNhoThaGiacMo-SonTungMTP-4009536.mp3',
            image: './assets/img/ST1.jpeg'
        },
        {
            name: 'Chúng ta của hiện tại',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/ChungTaCuaHienTai-SonTungMTP-6892340.mp3',
            image: './assets/img/ST2.jpeg'
        },
        {
            name: 'Có chắc yêu là đây',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/COCHACYEULADAY-SonTungMTP-6316913.mp3',
            image: './assets/img/ST3.jpeg'
        },
        {
            name: 'Chắc ai đó sẽ về',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/ChacAiDoSeVe-SonTungMTP-3666636.mp3',
            image: './assets/img/ST4.jpeg'
        },
        {
            name: 'Chúng ta không thuộc về nhau',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/ChungTaKhongThuocVeNhau-SonTungMTP-4528181.mp3',
            image: './assets/img/ST5.jpeg'
        },
        {
            name: 'Cơn mưa xa dần',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/Conmuaxadan.mp3',
            image: './assets/img/ST6.jpeg'
        },
        {
            name: 'Muộn rồi mà sao còn',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/MuonRoiMaSaoCon-SonTungMTP-7011803.mp3',
            image: './assets/img/ST7.jpeg'
        },
        {
            name: 'Lạc trôi',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/LacTroi-SonTungMTP-4725907.mp3',
            image: './assets/img/ST8.jpeg'
        },
        {
            name: 'Một năm mới bình an',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/MotNamMoiBinhAn-SonTungMTP-4315569.mp3',
            image: './assets/img/ST9.jpeg'
        },
        {
            name: 'Nơi này có anh',
            singer: 'Sơn Tùng MTP',
            path: './assets/song/NoiNayCoAnh-SonTungMTP-4772041.mp3',
            image: './assets/img/ST10.jpeg'
        }
    ],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''} ${isDarkMode ? 'app-dark-mode' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });
        playlist.innerHTML = htmls.join('');
    },
    
        defineProperties: function() {
            Object.defineProperty(this, 'currentSong', {
                get: function() {
                    return this.songs[this.currentIndex];
                }
            });
        },
        handleEvents: function() {
            const _this = this;
            const cdWidth = cd.offsetWidth;

            // Xử lý CD quay / dừng
            const cdThumbAnimation = cdThumb.animate([
                {transform: 'rotate(360deg)'}
            ], {
                duration: 10000, //10 sec
                iterations: Infinity
            })
            cdThumbAnimation.pause();

            // Xử lý khi cuộn xuống
            document.onscroll = function() {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const newCdWidth = cdWidth - scrollTop;
                cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
                cd.style.opacity = newCdWidth / cdWidth;
            }

            // Xử lý khi click play
            playBtn.onclick = function() {
                if(_this.isPlaying) {
                    audio.pause();
                } else {
                    audio.play();
                }
            }

            // Khi song được play
            audio.onplay = function() {
                _this.isPlaying = true;
                player.classList.add('playing');
                cdThumbAnimation.play();
            }

              // Khi song bị pause
              audio.onpause = function() {
                _this.isPlaying = false;
                player.classList.remove('playing');
                cdThumbAnimation.pause();

            }

            // Khi tiến độ bài hát thay đổi
            audio.ontimeupdate = function() {
                if(audio.duration) {
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercent;
                }
            }

            // Xử lý khi tua
            progress.oninput = function(e) {
                const seekTime = e.target.value / 100 * audio.duration;
                audio.currentTime = seekTime;
            }

            // Khi next bài hát
            nextBtn.onclick = function() {
                if(_this.isRandom) {
                _this.playRandomSong();
                } else {
                    _this.nextSong();
                }
                audio.play();
                _this.render();
                _this.scrollToActiveSong();
            }

             // Khi prev bài hát
             prevBtn.onclick = function() {
                if(_this.isRandom) {
                    _this.playRandomSong();
                    } else {
                        _this.prevSong();
                    }
                audio.play();
                _this.render();
                _this.scrollToActiveSong();
            }

             // Khi random bài hát
            randomBtn.onclick = function(e) {
                _this.isRandom = !_this.isRandom;
                _this.setConfig('isRandom', _this.isRandom);
                randomBtn.classList.toggle('active', _this.isRandom);

            }

            // Xử lý phát lại bài hát
            repeatBtn.onclick = function() {
                _this.isRepeat = !_this.isRepeat;
                _this.setConfig('isRepeat', _this.isRepeat);
                repeatBtn.classList.toggle('active', _this.isRepeat);
            }

             // Xử lý next song khi audio end
             audio.onended = function() {
                if(_this.isRepeat) {
                    audio.play();
                } else {
                    nextBtn.click();
                }
            }
              //Lắng nghe khi click vào playlist
            playlist.onclick = function(e) {
                const songNode = e.target.closest('.song:not(.active)');
                if(songNode || !e.target.closest('.option')) {
                    if(e.target.closest('.song:not(.active)')){
                        _this.currentIndex = Number(songNode.dataset.index);
                        _this.loadCurrentSong();
                        _this.render();
                        audio.play();
                    }
                }
            }
        },
        scrollToActiveSong: function() {
            setTimeout(() => {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }, 500)
        },
        loadCurrentSong: function() {
            heading.textContent = this.currentSong.name;
            cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
            audio.src = this.currentSong.path;
        },
        loadConfig: function() {
            this.isRandom = this.config.isRandom;
            this.isRepeat = this.config.isRepeat; 
        },
        nextSong: function() {
            this.currentIndex++;
            if(this.currentIndex >= this.songs.length) {
                this.currentIndex = 0;
            }
            this.loadCurrentSong();
        },
        prevSong: function() {
            this.currentIndex--;
            if(this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1;
            }
            this.loadCurrentSong();
        },
        playRandomSong: function() {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.songs.length);
            } while(newIndex === this.currentIndex);
            this.currentIndex = newIndex;
            this.loadCurrentSong();
        },
        start: function() {
            //Gắn cấu hình từ config vào app
            this.loadConfig();

            this.defineProperties();

            this.handleEvents();

            this.loadCurrentSong();

            this.render();

            randomBtn.classList.toggle('active', this.isRandom)
            repeatBtn.classList.toggle('active', this.isRepeat)
       }
    }
    app.start();
