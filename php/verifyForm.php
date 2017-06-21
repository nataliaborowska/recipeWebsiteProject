<?php 

if($_SERVER["REQUEST_METHOD"] == "POST"){
	$formData = array();
	$errors = array();
	$formData["userName"] = trim($_POST["userName"]);
	$formData["email"] = trim($_POST["email"]);
	$formData["opinion"] = trim($_POST["opinion"]);
	$formData["opinionDate"] = $_POST["opinionDate"];
	$formData["recipeAllData"] = $_POST["recipeAllData"];

	if(empty($formData["userName"])){
		$errors["userNameError"] = "please fill in the user name field";
	}
	else if(strlen($formData["userName"]) < 3){
		$errors["userNameError"] = "name must contain at least 3 characters";
	}

	if(!empty($formData["email"]) AND !(filter_var($formData["email"], FILTER_VALIDATE_EMAIL))){
		$errors["emailError"] = "please fill in the email field correctly";
	}

	if(isset($_POST["rating"])){
		$formData["rating"] = $_POST["rating"];
	}
	else{
		$errors["ratingError"] = "please fill in the rating field";
	}

	if(empty($formData["opinion"])){
		$errors["opinionError"] = "please fill in the opinion field";
	}

	if(empty($errors)){
		echo json_encode($formData);
	}
	else{
		echo json_encode($errors);
	}


}






?>