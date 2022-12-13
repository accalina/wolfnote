const server_host = "http://localhost:8091"
const show_all = true
let finished_task = []
let draft_task = []

function fetch_notes_data() {

    if (localStorage.getItem('user_token') === null){
        return ""
    }else{
        $('#authenticate').css("display", "none") 
        $('#taskview').css("display", "block") 
    }

    if (show_all) {
        url = `${server_host}/api/collections/todo/records?filter=(is_delete=False)&sort=is_done,created`
    } else {
        url = `${server_host}/api/collections/todo/records?filter=(is_delete=False%26%26is_done=False)&sort=is_done,created`
    }
    axios.get(url, {
        headers: {
            'Authorization': localStorage.getItem('user_token'),
            'Content-Type': 'application/json'
        }
    }).then(res => {
        basedata = res.data.items
        finished_task = basedata.filter((dt) => {
            return dt.is_done === true
        })
        draft_task = basedata.filter((dt) => {
            return dt.is_done === false
        })

        result = draft_task.map(item => `<li>${item.title}</li>`).join('')
        result = result + finished_task.map(item => `<li><strike>${item.title}</strike></li>`).join('')

        document.getElementById("tasklist").innerHTML = result
    })
}

function login() {
    if (localStorage.getItem('user_token') === null) {
        console.log('sending request to remote server')
        const payload = {
            "identity": $('#username').val(),
            "password": $('#password').val()
        }
        axios.post(`${server_host}/api/collections/users/auth-with-password`, data = payload, {
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(res => {
            $('#invalid-password').css("display", "none")
            localStorage.setItem('user_token', res.data.token)
            localStorage.setItem('user_fullname', res.data.record.name)
            $('#username').val('')
            $('#password').val('')
            console.log(`Welcome ${res.data.record.name}`)
            fetch_notes_data()
        }).catch(function (error) {
            $('#invalid-password').css("display", "table-row")
        })
    } else {
        console.log('loading data from session')
        fetch_notes_data()
    }
}

function logout(){
    localStorage.clear()
    $('#authenticate').css("display", "block") 
    $('#taskview').css("display", "none") 

}

$('#password').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        login()
    }
});

$('#login').click(function(){
    login()
})

$('#logout').click(function(){
    logout()
})

$('#fetch').click(function(){
    fetch_notes_data()
})

fetch_notes_data()