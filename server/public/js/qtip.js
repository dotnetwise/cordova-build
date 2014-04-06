!function($) {
    /* CONFIG */

    xOffset = 10;
    yOffset = 30;

    // these 2 variable determine popup's distance from the cursor
    // you might want to adjust to get the right result

    /* END CONFIG */
    $(document).on("mouseenter", ".preview", function (e) {
        var $this = $(this);
        this.t = $this.attr("title");
        this.title = "";
        var c = (this.t != "") ? "<br/>" + this.t : "";
        $("body").append("<p id='screenshot'><img src='" + $this.attr("rel") + "' alt='url preview' />" + c + "</p>");
        $("#screenshot")
            .css("top", (e.pageY - xOffset) + "px")
            .css("left", (e.pageX + yOffset) + "px")
            .fadeIn("fast");
    }).on("mouseleave", ".preview", function (e) {
        this.title = this.t;
        $("#screenshot").remove();
    }).on("mousemove", ".preview", function (e) {
        $("#screenshot")
            .css("top", (e.pageY - xOffset) + "px")
            .css("left", (e.pageX + yOffset) + "px");
    });	
}(jQuery);
