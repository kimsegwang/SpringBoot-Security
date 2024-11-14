console.log("mainpage.js is loading");
console.log("jQuery version:", $.fn.jquery);
$(document).ready(() => {

    setupAjax();
    checkToken();
    logout();
});

let logout = () => {
    $('#logout').click(() => {

        $.ajax({
            type: 'POST',
            url: '/logout',
            contentType: 'application/json; charset=utf-8',
            success: (response) => {
                alert(response.message);
                localStorage.removeItem('accessToken');
                window.location.href = response.url;
            },
            error: (error) => {
                console.log('logout 오류 발생 :: ', error);
                alert('로그아웃 중 오류가 발생했습니다!');
            }

        });
    });
}