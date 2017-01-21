
$(document).ready(function() {
    $('nav a').click(function(event) {
      $(this).modal({
        fadeDuration: 250
      });
      return false;
    });

    var socket = io("http://localhost:3000");

    $(".reg-btn").click(function() {
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
