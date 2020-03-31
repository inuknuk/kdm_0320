checkitem = function () {
    const $this = $("#myCarousel");
    if ($("#myCarousel .carousel-inner .item:first").hasClass("active")) {
        $this.children(".left").hide();
        $this.children(".right").show();
    } else if ($("#myCarousel .carousel-inner .item:last").hasClass("active")) {
        $this.children(".right").hide();
        $this.children(".left").show();
    } else {
        $this.children(".carousel-control").show();
    }
};

checkitem();
$(document).ready(function () {
    $("#myCarousel").on("slid.bs.carousel", checkitem);
});
