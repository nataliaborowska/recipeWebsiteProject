$(document).ready(function(){

	var $window = $(window);
	var $section = $("section");	
	var $headerHeight = $("header").outerHeight();
	var $nav = $("nav");
	var $navLink = $(".navLink");
	var $linkList = $(".navList").find(".navLink");
	var $navHeight = $nav.outerHeight();
	var $mobileNav = $(".mobileNav");
	var $searchForm = $("#searchForm");
	var $resultField = $(".resultField");
	var $searchField = $("#searchField");
	var $highRatingContainer = $(".highRatingContainer");
	var $sliderContainer = $(".sliderContainer");
	var $categoryList = $(".categoryList");
	var $prev = $(".prev");
	var $next = $(".next");
	var $popupWindow = $(".warningPopup");
	var $popupConsent = $("#popupConsent");
	var container;
	var solution = [];
	var pageTitle;

	//function to set scroll to top of the page
	function setScroll(){
		$("html, body").animate({ scrollTop: 0}, 500);
	}

	setScroll();

	//function to open popup window about cookies every 30 days
	function openPopup(cookieName){

		var regExpString = "(^|;\s?)"+cookieName+"=";
		var cookieRegExp = new RegExp(regExpString);
	
		if(document.cookie.match(cookieRegExp)){
			$popupWindow.css("display", "none");
		}
		else{
			$popupWindow.fadeIn("slow");
			var date = new Date();
			var days = 30;
			date.setDate(date.getDate() + days*60*60*24*1000);
			date.toUTCString();
			document.cookie = cookieName + "=yes; expires=" + date + ";path=/";
			$popupConsent.on("click", function(){
				$popupWindow.fadeOut("slow");
				return false;
			});
		}
	}

	openPopup("popup");

	// function to load stars in review
	function loadRating(rating, starContainer){
		var star = "";
		for(var i=0; i < rating; i++){
			star += "<span>★</span>";
		}		
		starContainer.html(star);
	}

	// function to render and load data into template in repetition
	function loadMultipleTemplate(container, templates, arrayLoaded, templateId, recipeUnit, button, multiple, wrapper, pageTitle, starContainer){
		var $recipeUnits;
		var $button;
		
		container.empty();
		setScroll();

		if(arrayLoaded.length > 0){
			arrayLoaded.map(function(recipe, i){
				var rating = recipe.rating;
								
				var template = $(templates).filter(templateId).html();
				var unitTemplate = Mustache.render(template, recipe);
				container.append(unitTemplate);

				var buttonData;
				$recipeUnits = $(recipeUnit);
				$button = $(button).eq(i);
				if(!rating){
					buttonData = recipe;
				}
				else{
					buttonData = recipe.recipeAllData;
					var $starContainer = $(starContainer).eq(i);
					loadRating(rating, $starContainer);
				}
				solution[i] = $button;
				solution[i].data("recipe",buttonData); 
			});

			for(var j = 0; j < $recipeUnits.length; j+=multiple){
				$recipeUnits.slice(j, j+multiple).wrapAll(wrapper);
			}
		}
		else{
			container.append("<div class='emptyResult'><h3>No results found</h3></div>");
		}
		container.prepend("<div class='pageTitle'><h2>" + pageTitle + "</h2></div>");
	}

	// function to load detailed recipe data, load and add opinions to local storage and display them on the page					
	function loadDetailedData(templates, templateId){
		
        var recipeData = $(this).data().recipe;
        
        container.empty();
        setScroll();
        
		var template = $(templates).filter(templateId).html();
		var unitTemplate = Mustache.render(template, recipeData);
		container.append(unitTemplate);    
        
		// function to validate opinion form before submission if javascript is turned on
		var $opinionForm = $("#opinionForm");
		var $opinionFields = $(":input").not(":input[type=submit], :input[type=radio]");
		var $mandatoryTextFields = $(".mandatoryText");
		var $formResponse = $("#formResponse");
		var $email = $("#email");
		var $userName = $("#userName");
		var $ratingInput = $(".rating input[type='radio']");
		var $ratingSpan = $(".rating span");
		var $errorComment = $(".errorComment");
		var $detailsContainer__reviews = $(".detailsContainer__reviews");
		var $reviewsContainer = $(".reviewsContainer");
		var opinionArray = [];
		var displayedOpinionArray = [];

		// function loading recipe opinions from local storage into a template
		function loadOpinionContent(container){
			var $reviewsTitle = $(".reviewsTitle");
			//number of miliseconds in a day
			var day = 1000 * 60 * 60 * 24;
			var currentDate = new Date().getTime();

			if(localStorage.getItem("opinion")){
				
				container.empty();
				displayedOpinionArray = JSON.parse(localStorage.getItem("opinion")).filter(function(item){
					return item.recipeAllData.name == recipeData.name;											
				});

				if(displayedOpinionArray.length !== 0){
					displayedOpinionArray.map(function(opinion,i){

						// calculate difference between current date and date when the opinion was made
						opinion.daysAgo = Math.round(Math.abs(currentDate - opinion.opinionDate)/day);

						if(opinion.daysAgo > 0){
							opinion.daysAgo += "days ago";
						}
						else if(opinion.daysAgo === 0){
							opinion.daysAgo = "today";
						}
						else{
							opinion.daysAgo += "day ago";
						}

						var template = $(templates).filter("#reviewTemplate").html();
						var opinionUnitTemplate = Mustache.render(template, opinion);
						container.append(opinionUnitTemplate);

						var $starContainer = $(".starContainer").eq(i);
						loadRating(opinion.rating, $starContainer);

					});
					if($reviewsTitle.length === 0){
						$detailsContainer__reviews.prepend("<h3 class='reviewsTitle'>Reviews</h3>");
					}
				}
			}
			// function to colour star rating when checked
			$ratingInput.attr("checked", false);
			$ratingInput.on("click", function(){
				$ratingSpan.removeClass("checked");
				$(this).parent().addClass("checked");
			});
		}

		loadOpinionContent($reviewsContainer);
		
		// function that validates user input from the form and if it is correct adds opinion about an item
        $opinionForm.on("submit", function(event){

			event.preventDefault();

			var $item;
			var errorCount = 0;
			var $containerParent = $(this).closest(".detailsContainer").find(".reviewsContainer");

			$errorComment.text("");
			$formResponse.empty();
			
			// javascript form validation
			$mandatoryTextFields.each(function(index, item){
				$item = $(item);
				if($item.val() === "" || $item.val().length < 1){
					$item.closest("li").find(".errorComment").text("please fill in the " + $item.attr("id") + " field");
					errorCount ++;
				}
			});

			if(!$ratingInput.is(":checked")){
				$ratingInput.closest("li").find(".errorComment").text("please choose the rating");
				errorCount ++;
			}

			if($userName.val().length > 0 && $userName.val().length < 3){
				$userName.prev().text("name must contain at least 3 characters");
				errorCount ++;
			}

			if($email.val().length > 0 && $email.val().search(/^([a-z0-9_\.-]+)@([a-z0-9_\.-]+)\.([a-z\.]{2,6})$/) == -1){
				$email.prev().text("please fill in the email field correctly");
				errorCount ++;
			}
			
			if(errorCount === 0){
				
				// if form validated correctly via javascript, I'm serializing form data and adding name of the currently displayed recipe to the string
				var opinionDate = new Date().getTime();
				var additionalData =  $.param({
					"opinionDate" : opinionDate,
					"recipeAllData" : recipeData});

				var opinionData = $opinionForm.serialize() + "&" + additionalData;
			
				$.ajax({
					type: "POST",
					data: opinionData,
					url: "php/verifyForm.php",
					cache: false,
					success: function(data){
						
						var responseData = $.parseJSON(data);
						var errorRegExp = new RegExp("Error");
						var incorrectData;
					
						// different response from the form depending on user input
						$.each(responseData, function(item, value){
						
							if(item.search(errorRegExp) != -1){
								$("#" + item).text(value);
								incorrectData = true;
							}
							else{
								$opinionFields.each(function(){
									$(this).val("");
									$ratingSpan.removeClass("checked");
								});
								$ratingInput.each(function(){
									$(this).prop("checked", false);
								});
								incorrectData = false;
							}	
						});
						//saving data from correctly filled form into local storage
						//JSON is a string representation of a javascript object.
					
						if(incorrectData === false){
							$formResponse.fadeIn(2000).html("<p>Thank you for giving your opinion!</p>").fadeOut(3000);
							if(localStorage.getItem("opinion") !== null){
								var value = localStorage.getItem("opinion");
								opinionArray = JSON.parse(value);
								opinionArray.push(responseData);
								localStorage.setItem("opinion", JSON.stringify(opinionArray));
							}
							else{
								opinionArray.push(responseData);
								localStorage.setItem("opinion", JSON.stringify(opinionArray));
							}
								
							loadOpinionContent($containerParent);
						}
					
					},
					error: function(jqXHR, textStatus, errorThrown){
						$formResponse.html("<p>The form was filled correctly, but there was an error on the server. Please try again.</p>");
					}
				});

			}
		});
		return false;
   }



	//function to load the highest rated recipes
	function loadHighestRecipes(){

		var highestReviewsArray = [];
		container = $highRatingContainer;

		if(localStorage.getItem("opinion")){
			container.empty();
			highestReviewsArray = JSON.parse(localStorage.getItem("opinion")).sort(function(itemA, itemB){
				return itemB.rating - itemA.rating;
			}).slice(0,3);
			
			$.get("templates/template.html", function(templates){

				loadMultipleTemplate(container, templates, highestReviewsArray, "#highReviewsTemplate", ".reviewUnit", ".reviewedRecipeDetails", 3, "<div class='highRatingContainer__items row'></div>", "Highest reviews", ".reviewedRecipeData__starContainer");
				
				solution.map(function($button){

		        	$button.on('click', function(){
		        		container = $section;
		        		loadDetailedData.call(this, templates, "#detailsTemplate");
		        	});
	        	});
			});
		}
	}

	//function to load random recipes of certain category into carousel
  	function loadGalleryData(){
		var categoriesArray = [];
		var CategoriesObject = {};
		
		$.ajax({
			type: "GET",
			url: "recipes.json",
			dataType: "JSON",
			cache: false,
			success: function(data){
				
				container = $categoryList;
				categoriesArray = $linkList.map(function(){
					return $(this).attr("href");
				}).toArray();
				
				$.each(categoriesArray, function(index, value){
					var categoryArray = [];
					var randomArray = [];
					var randomNumber;
					categoryArray = data.recipes.filter(function(recipe){
						return value == recipe.type;
					});
					while(randomArray.length < 3){
						randomNumber = Math.floor(Math.random()*categoriesArray.length);
						if(randomArray.indexOf(categoryArray[randomNumber]) == -1){
							randomArray.push(categoryArray[randomNumber]);
						}
					}	
					CategoriesObject[value] = randomArray;
				});
				$.get("templates/template.html", function(templates){
					var template = $(templates).filter("#galleryTemplate").html();
					$.each(CategoriesObject, function(index, value){
						var galleryUnitTemplate = Mustache.render(template, value);
						container.append(galleryUnitTemplate);
					});
					$sliderContainer.prepend("<h2>Gallery</h2>");

					var $categoryList__item = $(".categoryList__item");
					
					$categoryList__item.first().addClass("active");
					$categoryList__item.hide();
					$(".active").show();

					$prev.on("click", function(){
						moveBack();
					});
					$next.on("click", function(){
						moveForward();
					});

					function moveBack(){

						$(".active").removeClass("active").addClass("prevActive");
						if($(".prevActive").is(":first-child")){
							$categoryList__item.last().addClass("active");
						}
						else{
							$(".prevActive").prev().addClass("active");
						}
						$(".prevActive").fadeOut("slow");
						$(".prevActive").removeClass("prevActive");
						$(".active").fadeIn("slow");
					}

					function moveForward(){

						$(".active").removeClass("active").addClass("prevActive");
						if($(".prevActive").is(":last-child")){
							$categoryList__item.first().addClass("active");
						}
						else{
							$(".prevActive").next().addClass("active");
						}
						$(".prevActive").fadeOut("slow");
						$(".prevActive").removeClass("prevActive");
						$(".active").fadeIn("slow");
					}

				});
			}
		});
	}

	$.when(loadHighestRecipes()).then(loadGalleryData());

	$(document).on("click", ".navLink, .linkBack", loadRecipes);
	$searchForm.on("submit", loadRecipes);

	//loading recipes from json array
	function loadRecipes(event){

		var $clickedLink = $(this);
		
		$.ajax({
			type: "GET",
			url: "recipes.json", 
			dataType: "JSON",
			cache: false,
			success: function(data){
				var recipeArray = [];

				// loading recipies per specific type upon clicking navigation links
				if(event.type == "click"){
					var type = $clickedLink.attr("href");
					$navLink.removeClass("activeLink");

					if($clickedLink.attr("class") == "navLink"){
						$clickedLink.toggleClass("activeLink");
					}
					else if($clickedLink.attr("class") == "linkBack"){
						$("a[href='" + type + "']").toggleClass("activeLink");
					}
					
					container = $section;

					// filter out only recipes of certain type
					recipeArray = data.recipes.filter(function(recipe){
						return type == recipe.type;
					});
					
					// get page title from the type attribute of filtered recipes
					$.each(recipeArray, function(i, value){
						pageTitle = value.type;
					});
					
				}

				// loading recipies per name or type with the use of search form
				else if(event.type == "submit"){
					var searchValue = $searchField.val();
					var expression = new RegExp(searchValue, "i");
					event.preventDefault();
					container = $resultField;
					if(searchValue.length > 0){

						// filter out only recipes of that match the search phrase
						recipeArray = data.recipes.filter(function(recipe){
							return recipe.name.search(expression) != -1 || recipe.type.search(expression) != -1;
						});

						// get page title from the searched phrase
						pageTitle = "Search results for " + searchValue;
					}				
				}

				$.each(recipeArray, function(i,value){
					recipeArray[i].shortDescription = recipeArray[i].description.substring(0, 120);
				});

				// loading recipes from recipeArray into a template
				$.get("templates/template.html", function(templates){

					loadMultipleTemplate(container, templates, recipeArray, "#recipeTemplate", ".recipeUnit", ".buttonDetails", 2, "<div class='row recipeRow'></div>", pageTitle);

					// loading recipe details when clicking the "see more" button
		 			solution.map(function($button){

			        	$button.on('click', function(){
			        		container = $section;
			        		loadDetailedData.call(this, templates, "#detailsTemplate");
			        	});
	        		});
				});
			},
			error: function(jqXHR, textStatus, errorThrown){
				$section.empty();
				var status = jqXHR.status;
				var statusText = jqXHR.statusText;
				$section.append("<div class='error'><h1>" + status + " Error</h1><h2>" + statusText + "</h2></div>");
			}
		});
		return false;
	}

	//going back to home page on clicking the logo
	$(".homeLogo").on("click", reloadPage);
	function reloadPage(event){
		window.location.reload();
	}


	// on scroll down navbar disappears when it's lower then the header height, but it appears again on scroll up
	var top = 0;

	$window.on("scroll", scrollFunction);

	function scrollFunction(){

		var $scrollPosition = $(this).scrollTop();
		if($scrollPosition < top){
			$nav.removeClass("slideUp").addClass("slideDown");
			if($scrollPosition < $headerHeight){
				$nav.removeClass("slideDown");
			}
		}
		else if($scrollPosition > top && $scrollPosition > $headerHeight + $navHeight){
			$nav.removeClass("slideDown").addClass("slideUp");
		}
		top = $scrollPosition;

		// make mobile nav close on scroll
		$mobileNav.removeClass("openIcon");
		$nav.removeClass("openNav");

	}

	//function to open the mobile menu from the hamburger icon and hide the menu when you click away
	$mobileNav.on("click", function(event){
		$(this).toggleClass("openIcon");
		$nav.toggleClass("openNav");
		event.stopPropagation();
	});
	$("html").on("click", function(){
		if($mobileNav.hasClass("openIcon")){
		$mobileNav.removeClass("openIcon");
		$nav.removeClass("openNav");
		}
	});

});
