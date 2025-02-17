new Vue({
    el: "#app",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            boards : {},
            mode : 'std',
            mods : 'vn',
            sort : 'pp',
            load : false,
            no_player : false, // soon
        };
    },
    created() {
        this.LoadData(mode, mods, sort);
        this.LoadLeaderboard(sort, mode, mods);
    },
    methods: {
        LoadData(mode, mods, sort) {
            this.$set(this, 'mode', mode);
            this.$set(this, 'mods', mods);
            this.$set(this, 'sort', sort);
        },
        LoadLeaderboard(sort, mode, mods, action = -1) {
            // action:  0  - Pager back.
            // action:  1  - Pager forward.
            // action: -1  - Don't change page (default).
            // action: -2  - Reset pager on mode change, etc.
            if (window.event)
                window.event.preventDefault();

            let offset = 0;
            let limit = 50;
            switch (action) {
                case -2:
                    last_page = -1;
                    page = 0;
                    break;
                case 0:
                    page -= 1;
                    offset = page * 50;
                    break;
                case 1:
                    page += 1;
                    offset = page * 50;
                    break;
            }

            console.log(action);
            // @TODO Explain why.
            if (page !== 0 && action === 1) {
                limit = 51;
            }

            // window.history.replaceState('', document.title, `/leaderboard/${this.mode}/${this.sort}/${this.mods}?p=${page + 1}`);
            window.history.pushState('page2', 'Title', `/leaderboard/${this.mode}/${this.sort}/${this.mods}?p=${page + 1}`);
            this.$set(this, 'mode', mode);
            this.$set(this, 'mods', mods);
            this.$set(this, 'sort', sort);
            this.$set(this, 'load', true);
            this.$axios.get(`https://api.${domain}/v1/get_leaderboard`, { params: {
                mode: this.StrtoGulagInt(),
                sort: this.sort,
                offset: offset,
                limit: limit
            }}).then(res => {
                if (last_page === -1 && res.data.leaderboard.length !== 51 && offset !== 0) {
                    last_page = page + 1;
                }
                this.boards = res.data.leaderboard;
                this.$set(this, 'load', false);
            });
        },
        scoreFormat(score) {
            var addCommas = this.addCommas;
            if (score > 1000 * 1000) {
                if (score > 1000 * 1000 * 1000)
                    return `${addCommas((score / 1000000000).toFixed(2))} billion`;
                return `${addCommas((score / 1000000).toFixed(2))} million`;
            }
            return addCommas(score);
        },
        addCommas(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        StrtoGulagInt() {
            switch (this.mode + "|" + this.mods) {
                case 'std|vn': return 0;
                case 'taiko|vn': return 1;
                case 'catch|vn': return 2;
                case 'mania|vn': return 3;
                case 'std|rx': return 4;
                case 'taiko|rx': return 5;
                case 'catch|rx': return 6;
                case 'std|ap': return 8;
                default: return -1;
            }
        },
    },
    computed: {}
});
