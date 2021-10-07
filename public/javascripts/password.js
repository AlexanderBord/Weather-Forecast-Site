
//check if passwords are equal
(function () {
    window.addEventListener('DOMContentLoaded', function()
    {
        document.getElementById("submit").onclick = function (event) {
            const pw = document.getElementById("pw").value;
            const pw2 = document.getElementById("pw2").value;

            if(pw != pw2){
                let err = document.getElementById("errDiv");
                err.innerHTML = "Please enter same passwords"
                event.preventDefault();
            }
        };
    });
})();