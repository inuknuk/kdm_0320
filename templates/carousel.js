checkitem = function () {
    const $this = $("#myCarousel");
    if ($("#myCarousel .carousel-inner .item:first").hasClass("active")) {
        $this.children(".left").hide();
        $this.children(".right").show();
        console.log("first fonction checkitem")
    } else if ($("#myCarousel .carousel-inner .item:last").hasClass("active")) {
        $this.children(".right").hide();
        $this.children(".left").show();
        console.log("last fonction checkitem")
    } else {
        $this.children(".carousel-control").show();
    }
    console.log("test fonction checkitem")
};

checkitem();
$(document).ready(function () {
    $("#myCarousel").on("slid.bs.carousel", checkitem);
});
