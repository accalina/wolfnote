app = new Vue({
    el: "#core-instance",
    data: {
        "server_host": "http://localhost:8091",
        "auth": {
            "username": "",
            "password": "",
            "fullname": "",
            "token": ""
        },
        "notes": [],
        "new_task_title": "",
        "show_all": false
    },
    methods: {
        fetch_user_token: function () {
            console.log('fetching user data')
            if (sessionStorage.getItem('user_token')=== null){
                console.log('sending request to remote server')
                const payload = {
                    "identity": this.auth.username,
                    "password": this.auth.password
                }
                axios.post(`${this.server_host}/api/collections/users/auth-with-password`, data=payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(res => {
                    sessionStorage.setItem('user_token', res.data.token)
                    sessionStorage.setItem('user_fullname', res.data.record.name)
                    this.auth.token = res.data.token
                    this.auth.fullname = res.data.record.name
                    console.log(`Welcome ${res.data.record.name}`)
                }).catch(function(error){
                    alert('Invalid username / password')
                })
            }else{
                console.log('loading data from session')
                this.auth.token = sessionStorage.getItem('user_token')
                this.auth.fullname = sessionStorage.getItem('user_fullname')
                this.fetch_notes_data()
            }
        },
        logout: function(){
            sessionStorage.clear()
            this.auth.token = ''
            this.auth.fullname = ''
        },
        fetch_notes_data: function () {
            if (this.show_all) {
                url = `${this.server_host}/api/collections/todo/records?filter=(is_delete=False)&sort=is_done,created`
            }else {
                url = `${this.server_host}/api/collections/todo/records?filter=(is_delete=False%26%26is_done=False)&sort=is_done,created`
            }
            axios.get(url, {
                headers: {
                    'Authorization': this.auth.token,
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                this.notes = res.data.items
            })
        },
        update_notes_done: function (note_id, status) {
            const payload = {
                "is_done": status
            }
            this.update_notes(note_id, payload)
        },
        update_notes_delete: function (note_id) {
            const payload = {
                "is_delete": true
            }
            this.update_notes(note_id, payload)
        },
        update_notes: function (note_id, payload){
            axios.patch(
                `${this.server_host}/api/collections/todo/records/${note_id}`, payload,
                {headers: {
                    'Authorization': this.auth.token,
                    'Content-Type': 'application/json'
            }}).then(res => {
                this.fetch_notes_data()
            })
        },
        change_task_show_rules: function(){
            this.show_all = !this.show_all
            this.fetch_notes_data()
        },
        create_new_task: function(){
            payload = {
                title: this.new_task_title
            }
            axios.post(
                `${this.server_host}/api/collections/todo/records/`, payload,
                {headers: {
                    'Authorization': this.auth.token,
                    'Content-Type': 'application/json'
            }}).then(res => {
                this.new_task_title = ""
                this.fetch_notes_data()
            })
        }
    },
    created() {
        this.fetch_user_token()
    }
})