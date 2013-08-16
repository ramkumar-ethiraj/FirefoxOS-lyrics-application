$(document).ready(function() {
	var api_url;
	var artist;
	var input;
	var text, length;
	var height;
	var document_height;
	var songs_array = [ ];
	var songs_array_clean = [ ];
	var songs_array_ind = 0;
	var iframe;

	input = $(".input #artist");
	api_url = "http://lyrics.wikia.com/api.php?fmt=json&artist=";
	artist = "";
	$xhr = "";
	$data = "";
	$artist = "";
	$i = 0;
	$value = "";

	$(".top").on("click", function(event) {
		window.scrollTo(0, 0);
	});

	$(window).scroll(function() {
		scroll = $(window).scrollTop();

		if (scroll > 150) {
			if ($(".top").is(":visible") == false) {
				$(".top").stop().slideToggle("slow");
			}
		}
		else {
			if ($(".top").is(":visible") == true) {
				$(".top").stop().slideToggle("slow");
			}
		}
	});

	//Fitting text and the iframe.
	$(window).resize(function() {
		resize();
	});

	resize();

	input.on("keydown", function(event) {
		keydown_handler(event.keyCode);
	});

	function resize() {
		document_height = $(document).height();

		height = document_height - $("header").height();

		$i++;

		$(".start").fitText(1);

		$(".iframe").height(document_height);
		$(".forms").css("min-height", height);
	}

	function fit_text() {
		$(".artist-title").fitText(0.35);

		$(".album-title").each(function(index) {
			text = $(this).text();
			length = text.length;

			if (length > 24) {
				text = text.substr(0, 22) + "..";
			}

			$(this).text(text);
		});
	}

	function search(value) {
		//Songs with id:
		//lowercase, no symbols
		//8milefreestyle
		//5starsgeneral
		//whenimgone
		//keeptalking
		//anyman

		//searchvalue: when
		//start with when, loop trough id (ids are storred in an id array which is generated
		//at runtime): songs_array / songs_array_clean then reduce string length by one.

		value = stringclean(value);

		console.log("Searched for " + value);

		$value = value;

		var len, results, results_ind;

		results = [ ];
		results_ind = 0;

		len = songs_array_clean.length;

		for (i = 0; i < len; i++) {
			if (songs_array_clean[i].indexOf(value) != -1) {
				results[results_ind] = songs_array[i];

				results_ind++;
			}
		}

		len = results.length;

		$(".song").on("click", function() {
			song = $(this).children().text();

			song_click(song);
		});

		$("#search-results").remove();

		$resultsdiv = "<div class='album' id='search-results'>";
		$resultsdiv += "<div class='album-title'> <span>Search results: </span> </div>";

		for (i = 0; i < len; i++) {
			$resultsdiv += "<div class='song'> <span>" + results[i] + "</span> </div>";
		}

		$resultsdiv += "</div>";

		$(".search").after($resultsdiv);

		$(".song").on("click", function() {
			song = $(this).children().text();

			song_click(song);
		});
	}

	function stringclean(string) {
		var cleanstring = "", len;

		string = string.toLowerCase();

		len = string.length;

		for (i = 0; i < len; i++) {
			charcode = string.charCodeAt(i);

			if (charcode > 96 && charcode < 123) {
				cleanstring += string[i];
			}
		}

		return cleanstring;
	}

	//Song clicking.
	function song_click(song) {
		url = "http://lyrics.wikia.com/" + $artist + ":" + song;
		url = url.replace("'", "%27");

		window.scrollTo(0, 0);

		$("body").append("<div class='iframe'><iframe src='" + url + "' frameborder='0'/></div>");

		$("body").css("overflow", "hidden");

		iframe = $(".iframe");

		iframe.height(iframe.height() - $(".header").height());

		$(".close").show();

		$(".close").click(function() {
			$(".iframe").remove();

			$(".close").hide();

			$("body").css("overflow", "visible");
		});
	}

	function cssclean(string) {
		string = string.substr(0, string.indexOf('px'));
		string = Number(string);

		return string;
	}

	function keydown_handler(keyCode) {
		if (keyCode == 13) {
			artist = input.val();

			//TODO: prettify artist's name.

			if (artist != "") {
				get_song_from_artist(artist);
			}
		}
	}

	function get_song_from_artist(artist) {
		//Send the artist name trough the API.
		url = api_url + artist;

		$artist = artist;

		$.ajax({
			url: url,
			dataType: "jsonp",
			jsonpCallback: "json",
			contentType: "text/plain",
			error: function(xhr, status, error) {
				$xhr = xhr;
			}
		}).done(function(data) {
			$data = data;

			if (data.albums.length == 0) {
				$(".start").text("No songs found.");
			}
			else {
				$(".start").remove();

				recieved_data(data);
			}
		});
	}

	function recieved_data(data) {
		var i, j;

		artist = data.artist;
		albums = data.albums;

		$(".results .artist").empty();

		window.scrollTo(0, 0);

		$(".results .artist").append("<div class='artist-title'><span>" + artist + "</span></div>");
		$(".results .artist").append("<div class='search'> <input type='text' placeholder='Search a song by " + artist + " (to search, submit)' /> </div>");

		for (i = albums.length - 1; i >= 0; i--) {
			$album = "";

			albumtitle = albums[i].album;

			$album += "<div class='album'>";
			$album += "<div class='album-title'>Album name: " + albumtitle + "</div>";

			songs = albums[i].songs;

			for (j = 0; j < songs.length; j++) {
				song = songs[j];
				song = song.substr(song.indexOf(':') + 1, song.length);

				$("#songs").append("<option value='" + song + "' />");

				songs_array[songs_array_ind] = song;
				songs_array_clean[songs_array_ind] = stringclean(song);
				songs_array_ind++;

				$album += "<div class='song' id='" + song + "'>";
				$album += "<span>" + song + "</span>";
				$album += "</div>";
			}

			$album += "</div>";

			$(".results .artist").append($album);
		}

		// Currently not working on FirefoxOS.
		// $(".search input").attr("list", "songs");

		$(".search input").on("change", function(event) {
			search($(".search input").val());
		});

		$(".search input").focus();

		fit_text();

		$(".song").on("click", function() {
			song = $(this).children().text();

			song_click(song);
		});

		//artist
		//albums array
		//each album has album (name), amazonLink, songs (array)
	}
});
