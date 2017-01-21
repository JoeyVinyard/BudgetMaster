
$(document).ready(function() {
    $('nav a').click(function(event) {
      $(this).modal({
        fadeDuration: 250
      });
      return false;
    });

    var socket = io("http://localhost:3000");

    socket.on('connStat', function(user){
        socket.emit('loadData', user);
    });

    $(".login-btn").click(function(event) {
        event.preventDefault();
        console.log($(".login-username").val().trim(),$(".login-password").val().trim());
        socket.emit("log", {
            username: $(".login-username").val().trim(),
            password: $(".login-password").val().trim(),
        });
    });

    $(".reg-btn").click(function(event) {
        event.preventDefault();

        var fullAddress = $(".reg-address").val().split(/\s+/);

        var addressNumber = fullAddress[0];
        var addressRest = fullAddress.splice(1).join(" ");

        var fullName = $(".reg-fullname").val().split(/\s+/);

        socket.emit("reg", {
            firstName: fullName[0],
            lastName: fullName[1],

            username: $(".reg-username").val(),
            password: $(".reg-password").val(),

            streetNum: addressNumber,
            streetName: addressRest,

            city: $(".reg-city").val(),
            zip: $(".reg-zipcode").val(),
        });
    });
});
