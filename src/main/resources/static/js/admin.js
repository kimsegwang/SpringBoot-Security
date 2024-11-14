$(document).ready(() => {
    setupAjax();
    checkToken();

    $.ajax({
        type: 'GET',
        url: '/api/admin',
        success: (response) => {
            console.log('res :: ',response)
        },
        error: (xhr) => {
            console.log('err :: ', xhr.status)
            if (xhr.status === 401) {
                handleTokenExpiration();
            } else if (xhr.status === 403 ) {
                window.location.href = '/access-denied'
            } else {
                reject(xhr); // 오류가 발생한 경우 Promise를 거부
            }
        }
    });
});