var link = window.location.href;
var url = new URL(link);

var isAuth = getCookie("auth_token") ? true : false;


var link2 = window.location.href;
var url2 = new URL(link2);

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
var setting;
settingSets.forEach((setting, i) => {
	if (setting.url.substr(0, setting.url.length - 1) == new URL(window.location.href).origin) {
		settings = setting;
	}
});




let new_settapi = settings.api;
let new_setturl = settings.url;

if(!isAuth){
	window.location.href = settings.url;
}

let user_table_body = document.querySelector('#user_table_body');

async function myProfilesinfo() {
		const response = await fetch(`${new_settapi}api/profile?number=2000`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
}).then(data => data.json());
	console.log(response);
	for(let i = 0; i<response.length; i++){
		console.log(response[i]);
		let tr = document.createElement('tr');
		tr.classList.add(response[i].uuid);
		var str = response[i].photo;
		var extArray = str.split(".");
		var ext = extArray[extArray.length - 1];
		
		var replacement = "media"; 
		var toReplace = "thumb"; 
		var str1 = str.replace(replacement, toReplace);
		tr.innerHTML = `<td><img src='${response[i].photo==""||response[i].photo==undefined ? settings.url+"/images/default_avatar.png" : str1+"/45x45~crop~12."+ext}'/></td><td>${response[i].last_name + ' ' + response[i].first_name + ' ' + response[i].middle_name}</td><td><div class="bd_dd"><div class="bd_dd_cont"><p>${response[i].dob != null ? response[i].dob : ''}</p><p>|</p><p>${response[i].dod != null ? response[i].dod : ''}</p></div><div class="user_changed"><a class="user_changed_link" href="${window.location.origin}/gen/?id=${response[i].uuid}&d=5"><i class="fa fa-link" aria-hidden="true"></i></a><div class="user_changed_info" onclick="user_changed_info('${response[i].uuid}', '${response[i].last_name}', '${response[i].first_name}', '${response[i].middle_name}', '${str1+"/320x320~crop~12."+ext}', '${response[i].dob}', '${response[i].dod}', '${response[i].gender}')"><img src="${settings.url}images/pen.png"></div></div></div></td>`;
		user_table_body.append(tr); 
	}
}

window.onload = myProfilesinfo();


let userIdFrom; 
let value_gender;
function setGenders(item){
	value_gender = item.value;
}

let dynamic_id; 

//редактировать профиль
function user_changed_info(id, last_name, first_name, middle_name, usr_photo, dob, dod, gender_val){
	let add_user_profile_container = document.querySelector('.add_user_profile_cont_fixed');
	let add_user_profile_close_popup = document.querySelector('.add_user_profile_close_popup');
	let user_profile_surname_inp = document.querySelector('.user_profile_surname_inp');
	let user_profile_name_inp = document.querySelector('.user_profile_name_inp');
	let user_profile_middlename_inp = document.querySelector('.user_profile_middlename_inp');
	let add_user_profile_photo = document.querySelector('.add_user_profile_photo');
	let add_user_profile_overbottom = document.querySelector('.add_user_profile_overbottom');
	let add_user_profile_bd = document.querySelector('.add_user_profile_bd');
	let add_user_profile_dd = document.querySelector('.add_user_profile_dd');
	//let add_user_profile_mother_input = document.querySelector('.add_user_profile_mother_input');
	//let add_user_profile_father_input = document.querySelector('.add_user_profile_father_input');
	let profile_mother_input = document.querySelector('#profile_mother_input');
	let profile_father_input = document.querySelector('#profile_father_input');
	let moth_inp = document.querySelector('.moth_inp');
	let fath_inp = document.querySelector('.fath_inp');
	
	
	
	let nophoto_but = document.querySelector('.nophoto_but');
	let cheked_gend = document.getElementsByName('gender');
	
	let warning1 = document.querySelector('.warning1');
	
	window.history.pushState(null, null, url.search);
	addEventListener("popstate",function(e){
    	window.location.reload();
	},false);
	
	warning1.innerHTML = "";
	dynamic_id = id;
	
	userIdFrom = id;
	if(isAuth){
	setProfile();
	}
	
	user_profile_surname_inp.value = '';
	user_profile_name_inp.value = '';
	user_profile_middlename_inp.value = '';
	//add_user_profile_mother_input.value = '';
	//add_user_profile_father_input.value = '';
	
	//открываем окно для родителей
	let rootDialog1 = document.querySelector('.rootDialog1');
	let rootDialog2 = document.querySelector('.rootDialog2');
	profile_mother_input.addEventListener('click', ()=>{
		rootDialog1.style.display = "flex";
		getUsparent();
		get_info_about_parents();
	});
	profile_father_input.addEventListener('click', ()=>{
		rootDialog2.style.display = "flex";
		getUsparent();
		get_info_about_parents();
	})
	
	
	
	if(gender_val!=null || gender_val!=undefined){
		cheked_gend.forEach( item => {
      		if( item.value == gender_val){
        		item.checked = true;
      		} else{
        		item.checked = false;
      		}
		});
	}else{

	}
	
	
		user_profile_name_inp.addEventListener("input", function() {
  			this.value = this.value[0].toUpperCase() + this.value.slice(1);
		});
		user_profile_surname_inp.addEventListener("input", function() {
			this.value = this.value[0].toUpperCase() + this.value.slice(1);
		});
		user_profile_middlename_inp.addEventListener("input", function() {
  			this.value = this.value[0].toUpperCase() + this.value.slice(1);
		});
	
	
	
	//обрезка файлов

	var bs_modal = $('#modal');
    var image = document.getElementById('image');
    var cropper,reader,file;
	var cropBoxData;
    var canvasData;

    $("body").on("change", ".image", function(e) {
        var files = e.target.files;
        var done = function(url) {
            image.src = url;
            bs_modal.modal('show');
        };
		

        if (files && files.length > 0) {
            file = files[0];

            if (URL) {
                done(URL.createObjectURL(file));
            } else if (FileReader) {
                reader = new FileReader();
                reader.onload = function(e) {
                    done(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    bs_modal.on('shown.bs.modal', function() {
        cropper = new Cropper(image, {
            aspectRatio: 1,
            /*viewMode: 3,
            preview: '.preview'*/
			autoCropArea: 0.5,
          	ready: function () {
            //Should set crop box data first here
            cropper.setCropBoxData(cropBoxData).setCanvasData(canvasData);
          }
        });
    }).on('hidden.bs.modal', function() {
       /* cropper.destroy();
        cropper = null;*/
		 cropBoxData = cropper.getCropBoxData();
        canvasData = cropper.getCanvasData();
        cropper.destroy();
    });

    $("#crop").click(function() {
        canvas = cropper.getCroppedCanvas({
            width: 160,
            height: 160,
        });//.toDataURL("image/png");
		
		console.log(canvas);
        canvas.toBlob(function(blob) {
            url = URL.createObjectURL(blob);
			console.log(url);
            var reader = new FileReader();
			console.log(reader);
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
                var base64data = reader.result;
				//var new_ing = new Image();
				//new_ing.src = base64data;
				
				//start
				
				
				
				let str1 = base64data;
					//Обрезаем конец:
				var from1 = str1.search('base64') + 7; 
				var to1 = str1.length;
				let newstr1 = str1.substr(from1,to1);
				
				var form1 = new FormData();
				form1.append("uuid", id);
				form1.append("photo", newstr1);
				console.log(newstr1);

				var settings = {
  					"url": `${new_settapi}api/profile`,
  					"method": "PUT",
  					"timeout": 0,
  					"headers": {
  					  "Authorization": `Token ${getCookie("auth_token")}`
  					},
  					"processData": false,
  					"mimeType": "multipart/form-data",
  					"contentType": false,
  					"data": form1,
					success: function(){
						setTimeout(function(){
							window.location.reload();
						},1000)
					},
					error: function(){
						console.log('ошибка');
					}
					};

					$.ajax(settings).done(function (response) {
						
  						console.log(response);
					});
				
				
				
				
				
            };
        });
    });

	
	//обезличивание 
	
	
	function deleteacc(){
		var form12 = new FormData();
		form12.append("uuid", id);

		var settings = {
  		"url": `${new_settapi}api/profile`,
  		"method": "DELETE",
  		"timeout": 0,
  		"headers": {
    		"Authorization": `Token ${getCookie("auth_token")}`
  		},
  		"processData": false,
  		"mimeType": "multipart/form-data",
  		"contentType": false,
  		"data": form12,
		success: function(){
			warning1.innerHTML = '';
			setTimeout(function(){
				window.location.reload();
			},1000)
		},
			error: function(response){
				let first_resp = response.responseText;
				let pars1 = JSON.parse(first_resp);
				warning1.innerHTML = pars1.message;
			}
		};

		$.ajax(settings).done(function (response) {
  		console.log(response);
		});		
	}
	
	
	
	
	nophoto_but.addEventListener('click', function(){
		let confirm_do = confirm('Обезличивание приведёт к полной очистке данных профиля. Вы уверены?');
		if(confirm_do == true){
			deleteacc();	
		}else{
			console.log('Не обезличивать');
		}
		
	})
	
	
	
	//конец
	
	user_profile_surname_inp.value = last_name;
	user_profile_name_inp.value = first_name;
	user_profile_middlename_inp.value = middle_name;
	add_user_profile_bd.value = dob=='null'?'':dob;
	add_user_profile_dd.value = dod=='null'?'':dod;
	console.log(dod, add_user_profile_dd.value);
	console.log(dob, add_user_profile_bd.value);
	/*add_user_profile_bd.value = dob;
	add_user_profile_dd.value = dod;*/
	add_user_profile_photo.setAttribute('src', `${usr_photo == '' ? settings.url+'images/default_avatar.png' : usr_photo}`);
	
	
	add_user_profile_container.style.display = "block";
	console.log(id);
	console.log(last_name);
	console.log(first_name);
	console.log(middle_name);
	
	async function getUsparent() {
		const response = await fetch(`${settings.api}api/profile_genesis?uuid=${getCookie('user_uuid')}&depth=100`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
}).then(data => data.json());
		for(let i = 0; i<response.connections.length; i++){
			console.log(response)
			console.log(id)
				if(response.connections[i].source == id && response.connections[i].is_mother == true){
					//add_user_profile_mother_input.value = response.connections[i].target;
					moth_inp.value = response.connections[i].target;
					console.log(response.connections[i].target);
				}
				else if(response.connections[i].source == id && response.connections[i].is_father == true){
					//add_user_profile_father_input.value = response.connections[i].target;
					fath_inp.value = response.connections[i].target;
		}
	}
		
	}
	//getUsparent();
	/*let mother_fio = document.querySelector('.mother_fio');
	let father_fio = document.querySelector('.father_fio');
	mother_fio.innerHTML='';
	father_fio.innerHTML='';*/
	let moth_text = document.querySelector('.moth_text');
	let moth_text2 = document.querySelector('.moth_text2');
	let fath_text = document.querySelector('.fath_text');
	let fath_text2 = document.querySelector('.fath_text2');
	let fath_text2_response;
	let moth_text2_response;
	async function get_info_about_parents() {
		const response = await fetch(`${new_settapi}api/profile?uuid=${id}&number=2000`, {
		method: "GET",
		headers: {
			/*"Authorization": 'Token ' + getCookie("auth_token")*/
		}
		}).then(data => data.json());
		if(response.mother != null){
			moth_text.innerHTML = `${response.mother.last_name} ${response.mother.first_name} ${response.mother.middle_name} <a class="user_changed_link" href="${window.location.origin}/gen/?id=${response.mother.uuid}&d=5"><i class="fa fa-link" aria-hidden="true"></i></a>`;
			moth_text2_response = `${response.mother.last_name} ${response.mother.first_name} ${response.mother.middle_name} <a class="user_changed_link" href="${window.location.origin}/gen/?id=${response.mother.uuid}&d=5"><i class="fa fa-link" aria-hidden="true"></i></a>`;
			moth_text2.innerHTML = moth_text2_response;
		}else{
			moth_text.innerHTML = 'Не задана мама';
			moth_text2_response = 'Не задана мама';
			moth_text2.innerHTML = moth_text2_response;
		}
		if(response.father != null){
			fath_text.innerHTML = `${response.father.last_name} ${response.father.first_name} ${response.father.middle_name} <a class="user_changed_link" href="${window.location.origin}/gen/?id=${response.father.uuid}&d=5"><i class="fa fa-link" aria-hidden="true"></i></a>`;
			fath_text2_response = `${response.father.last_name} ${response.father.first_name} ${response.father.middle_name} <a class="user_changed_link" href="${window.location.origin}/gen/?id=${response.father.uuid}&d=5"><i class="fa fa-link" aria-hidden="true"></i></a>`;
			fath_text2.innerHTML = fath_text2_response;
		}else{
			fath_text.innerHTML = 'Не задан папа';
			fath_text2_response = 'Не задан папа';
			fath_text2.innerHTML = fath_text2_response;
		}
		
	}
	
	
	
	
	get_info_about_parents();
	
	
	
	
	
	async function add_user_parents(operation_type_id, add_user_profile_mother_input){
	
				var settings = {
  					"url": `${new_settapi}api/addoperation`,
  					"method": "POST",
  					"timeout": 0,
  					"headers": {
    					"Authorization": `Token ${getCookie("auth_token")}`,
    					"Content-Type": "application/json"
  					},
  					"data": JSON.stringify({
    					"user_id_from": id,
    					"user_id_to": add_user_profile_mother_input,
    					"operation_type_id": operation_type_id
  					}),
					success: function(response){
						//warning1.innerHTML = '';
						rootDialog1.style.display = 'none';
						rootDialog2.style.display = 'none';
						get_info_about_parents();
						fath_text2.innerHTML = fath_text2_response;
						moth_text2.innerHTML = moth_text2_response;
					},
					error: function(response){
						let first_resp = response.responseText;
						let pars1 = JSON.parse(first_resp);
						//warning1.innerHTML = pars1.message;
						if(rootDialog1.style.display == 'flex'){
							moth_text.innerHTML = pars1.message;
						}else if(rootDialog2.style.display == 'flex'){
							fath_text.innerHTML = pars1.message;
						}
					}
					};

					$.ajax(settings).done(function (response) {
  					console.log(response);
					});
			
		
		}
		
		
		
		
		
		async function myProfilesinfo1() {
		const response = await fetch(`${settings.api}api/profile_genesis?uuid=${getCookie('user_uuid')}&depth=100`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
}).then(data => data.json());		
			//var b;
			if(moth_inp.value.includes('id')){
				/*let str = add_user_profile_mother_input.value;
					//Обрезаем конец:
				var from = str.search('id=') + 3; 
				var to = str.length;
				let newstr = str.substr(from,to);
				console.log(newstr);
				add_user_profile_mother_input.value = newstr;*/
				url2.href = moth_inp.value;
				let newstr = url2.searchParams.get('id');
				moth_inp.value = newstr;
				console.log(newstr);
			}
			//var b;
			if(fath_inp.value.includes('id')){
				/*let str3 = add_user_profile_father_input.value;
					//Обрезаем конец:
				var from3 = str3.search('id=') + 3; 
				var to3 = str3.length;
				let newstr3 = str3.substr(from3,to3);
				console.log(newstr3);
				add_user_profile_father_input.value = newstr3;*/
				//
				url.href = fath_inp.value;
				let newstr3 = url.searchParams.get('id');
				fath_inp.value = newstr3;
				console.log(newstr3);
			}
			console.log(response);
			let users_resp = [];
			for(let i = 0; i<response.connections.length; i++){
				if(response.connections[i].source == id){
					if(response.connections[i].target == moth_inp.value && response.connections[i].source == id && response.connections[i].target == fath_inp.value && response.connections[i].source == id){
					   console.log('То же что и было');
					}else{
						if(moth_inp.value!= '' && response.connections[i].is_mother == true){
						add_user_parents(7, response.connections[i].target);
						add_user_parents(8, moth_inp.value);
						}
						if(moth_inp.value!= '' && response.connections[i].is_mother == false){
							add_user_parents(8, moth_inp.value);
						}
						if(moth_inp.value == '' && response.connections[i].is_mother == true){
							add_user_parents(7, response.connections[i].target);
						}
						//father
						if(fath_inp.value!= '' && response.connections[i].is_father == true){
						add_user_parents(7, response.connections[i].target);
						add_user_parents(6, fath_inp.value);
						}
						if(fath_inp.value!= '' && response.connections[i].is_father == false){
							add_user_parents(6, fath_inp.value);
						}
						if(fath_inp.value == '' && response.connections[i].is_father == true){
							add_user_parents(7, response.connections[i].target);
						}
						
						
					}
				}
				else{
					
					users_resp.push('none');
				}
				
				
				
			}
			
			if(response.connections.length == users_resp.length){
				if(fath_inp.value!= ''){
					add_user_parents(6, fath_inp.value)
				}
				if(moth_inp.value!= ''){
					add_user_parents(8, moth_inp.value)
				}
				console.log(users_resp);
				//add_user_parents(8, add_user_profile_mother_input.value)
			}
		}
let dialog_mother_save = document.querySelector('.rootDialog1 #rootAddElementMenu');
let dialog_father_save = document.querySelector('.rootDialog2 #rootAddElementMenu');
dialog_mother_save.addEventListener('click', ()=>{
		myProfilesinfo1();
});
dialog_father_save.addEventListener('click', ()=>{
		myProfilesinfo1();
});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//Кнопка Сохранить
	add_user_profile_overbottom.addEventListener('click', function(){
		
		//warning1.innerHTML = "";
		  
		if(value_gender==undefined && gender_val==null){
			warning1.innerHTML = "Выберите пол";
		}
		
		
		
		
		
		
		
		
		//add_user_parents(7);
		//add_user_parents(6);
		
		
		
	
		//alert(`${day}-${month}-${year}`)
		
		
		
		
		var formdata = new FormData();
		formdata.append("uuid", id);
		formdata.append("first_name", user_profile_name_inp.value);
		formdata.append("last_name", user_profile_surname_inp.value);
		formdata.append("middle_name", user_profile_middlename_inp.value);
		formdata.append("dob", add_user_profile_bd.value);
		formdata.append("dod", add_user_profile_dd.value);
		formdata.append("gender", value_gender? value_gender : gender_val ? gender_val : '');
		
	function add_gen(){	
		var settings = {
  					"url": `${new_settapi}api/profile`,
  					"method": "PUT",
  					"timeout": 0,
  					"headers": {
  					  "Authorization": `Token ${getCookie("auth_token")}`
  					},
  					"processData": false,
  					"mimeType": "multipart/form-data",
  					"contentType": false,
  					"data": formdata,
					success: function(response){
						console.log(response);
						warning1.innerHTML = '';
					},
					error: function(response){
						let first_resp = response.responseText;
						let pars1 = JSON.parse(first_resp);
						warning1.innerHTML = pars1.message;
					}
					};

					$.ajax(settings).done(function (response) {
						//url.searchParams.append('add_new_user', )
						
					});
		
		
		
		
	}
		
		add_gen();
		
		
		setTimeout(function(){
			if(warning1.innerHTML == ''){
				window.location.reload();
			}
		}, 3500)
	});
	
	
	
	
	//закрыть попап
	add_user_profile_close_popup.addEventListener('click', function(){
		if(user_profile_surname_inp.value != last_name || user_profile_name_inp.value != first_name || user_profile_middlename_inp.value != middle_name){
			let user_profile_not_save = confirm('Есть несохранённые данные. Всё равно закрыть?');
			if(user_profile_not_save == true){
				window.location.reload();
			}
		}else{
		window.location.reload();
		}
	})
	
}

window.onload = function(){
if(localStorage.getItem('npuuid')){
	 user_changed_info(localStorage.getItem('npuuid'), localStorage.getItem('lastName'), localStorage.getItem('fName'), localStorage.getItem('midName'), '', null, null, localStorage.getItem('gender'));
		localStorage.removeItem('npuuid');
		localStorage.removeItem('fName');
		localStorage.removeItem('lastName');
		localStorage.removeItem('midName');
		localStorage.removeItem('gender');
}
}

let gender_value;

function setGender(gender_val){
	gender_value = gender_val.value;
	console.log(gender_val.value);
	console.log(gender_value);
}


//Добавить новый профиль
let new_api_str = settings.api
let add_profile_but = document.querySelector('.add_profile_but');
let add_user_profile_container_prew = document.querySelector('.add_user_profile_container_prew');
add_profile_but.addEventListener('click', function(){
	add_user_profile_container_prew.style.display = 'block';
	let add_user_profile_close_popup_new = document.querySelector('.add_user_profile_close_popup_new');	
	let user_profile_surname_inp = document.querySelector('#user_profile_surname_inp');
	let user_profile_name_inp = document.querySelector('#user_profile_name_inp');
	let user_profile_middlename_inp = document.querySelector('#user_profile_middlename_inp');
	let add_user_profile_overbottom = document.querySelector('#add_user_profile_overbottom');
	let error_in_add = document.querySelector('.error_in_add');
	let new_profile_user_uuid;
	let cheked_gend = document.getElementsByName('gender');
	
	//Выбор пола
	window.history.pushState(null, null, url.search);
	addEventListener("popstate",function(e){
    	window.location.reload();
	},false);
	
	
	//обнуление полей
	user_profile_name_inp.value = '';
	user_profile_surname_inp.value = '';
	user_profile_middlename_inp.value = '';
	cheked_gend.forEach( item => {
        item.checked = false;
	});
	
	
	
	//закрыть попап
	add_user_profile_close_popup_new.addEventListener('click', function(){
		
		window.location.reload();
		
	})
	
	//Создание юида
	//add_user_profile_overbottom.addEventListener('click', function(){
	
	user_profile_name_inp.addEventListener("input", function() {
  		this.value = this.value[0].toUpperCase() + this.value.slice(1);
	});
	user_profile_surname_inp.addEventListener("input", function() {
  		this.value = this.value[0].toUpperCase() + this.value.slice(1);
	});
	user_profile_middlename_inp.addEventListener("input", function() {
  		this.value = this.value[0].toUpperCase() + this.value.slice(1);
	});
	
	add_user_profile_overbottom.addEventListener('click', function(){
		error_in_add.innerHTML = "";
		var form = new FormData();
	if(user_profile_name_inp.value != ''){
		form.append("first_name", user_profile_name_inp.value);
	}
	if(user_profile_surname_inp.value != ''){
		form.append("last_name", user_profile_surname_inp.value);
	}
	if(user_profile_middlename_inp.value != ''){
		form.append("middle_name", user_profile_middlename_inp.value);
	}
	if(gender_value!=undefined){
		form.append("gender", gender_value);
	}
	if(gender_value==undefined){
		error_in_add.innerHTML = "Выберите пол"
	}
	if(gender_value!=undefined){
	
				var settings = {
  					"url": `${new_api_str}api/profile`,
  					"method": "POST",
  					"timeout": 0,
  					"headers": {
  					  "Authorization": `Token ${getCookie("auth_token")}`
  					},
  					"processData": false,
  					"mimeType": "multipart/form-data",
  					"contentType": false,
  					"data": form,
					success: function(response){
						
						console.log(response)
						let str1 = response;
						let pars1 = JSON.parse(str1);
						new_profile_user_uuid = pars1.uuid;
						let last_name = pars1.last_name;
						let fName;
						//if(user_profile_name_inp!=''){
							fName = pars1.first_name;
						let midName = pars1.middle_name;
						let gender_val = pars1.gender;
						//}
						console.log(pars1);
						localStorage.setItem('npuuid', new_profile_user_uuid);
						localStorage.setItem('lastName', last_name);
						//if(user_profile_name_inp!=''){
							localStorage.setItem('fName', fName);
						localStorage.setItem('midName', midName);
						localStorage.setItem('gender', gender_val);
						//}
						
					},
					error: function(response){
						//let str1 = response;
						//let pars1 = JSON.parse(str1);
						//console.log(pars1);
						let first_resp = response.responseText;
						let pars1 = JSON.parse(first_resp);
						error_in_add.innerHTML = pars1.message;
					}
					};

					$.ajax(settings).done(function (response) {
						setTimeout(function(){
							if(error_in_add.innerHTML == ""){
								window.location.reload();
							}
						},2000);
					});
		}
		
		})
					
						/*async function add_detail_profile_info(){
						const response = await fetch(`${new_api_str}api/profile`, {
						method: "PUT",
						headers: {
							"Authorization": `Token ${getCookie("auth_token")}`
						},
						body: formdata
						}).then(response => response.ok ? response.text() && window.location.reload() : console.log('bad'));
	
	
						}
						*/
						
		
		
		
		
		
		
		
	//});
	
	
	
	
	
})
//maps
let map_users = [];
let response_smat_map;


async function setProfile() {
	/*const response = await fetch(`${settings.api}api/profile_graph?uuid=${getCookie("user_uuid")}`/*`${settings.api}api/getprofileinfo?uuid=${getCookie("user_uuid")}`*//*, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
	}).then(data => data.json());
	map_users.push({
		user_photo: response.users[0].photo,
		user_name: response.users[0].first_name,
		user_lastname: response.users[0].last_name,
		user_latitude: response.users[0].latitude,
		user_longitude: response.users[0].longitude,
		user_ability: response.users[0].ability,
		user_uuid: response.users[0].uuid
	} );
	response_smat_map = map_users;
	console.log(map_users);*/
		
		
	var form = new FormData();
	form.append("uuid", `${userIdFrom ? userIdFrom : getCookie("auth_token")}`);
	/*form.append("latitude", `${new_cur_pos_marker_lat ? new_cur_pos_marker_lat : lati ? lati : null}`);	
	form.append("longitude", `${new_cur_pos_marker_lng ? new_cur_pos_marker_lng : long ? long : null}`);*/
	var settings = {
  		"url": `${new_settapi}api/profile?number=2000`,
  		"method": "GET",
  		"timeout": 0,
  		"headers": {
  		  "Authorization": `Token ${getCookie("auth_token")}`
  		},
  		"processData": false,
  		"mimeType": "multipart/form-data",
  		"contentType": false,
  		"data": form
	};

	$.ajax(settings).done(function (response) {
		let first_resp = response;
		let pars2 = JSON.parse(first_resp);
		
		for(let i=0;i<pars2.length;i++){
			if(pars2[i].uuid == userIdFrom){
				map_users.push({
					user_photo: pars2[i].photo,
					user_name: pars2[i].first_name,
					user_lastname: pars2[i].last_name,
					user_latitude: pars2[i].latitude,
					user_longitude: pars2[i].longitude,
					user_ability: pars2[i].ability,
					user_uuid: pars2[i].uuid
				} );
				console.log(map_users);
			}
			if(pars2[i].uuid == userIdFrom && pars2[i].latitude!=null && pars2[i].longitude!=null){
				get_position.style.backgroundColor = '#6be86b';
				get_position.style.color = '#fff';
				get_position.style.borderColor = '#6be86b';
				get_position.style.boxShadow = '0px 0px 10px 9px rgba(142, 198, 60, 0.4)';
			}
		}
		
		console.log(map_users);
  		response_smat_map = map_users;
});
}


let get_position = document.querySelector('#get_position');
let mapid = document.querySelector('#mapid');
let map_container = document.querySelector('.map_container');
let mapid_close = document.querySelector('.mapid_close');
let mapid_send = document.querySelector('.mapid_send');
let mapid_clean = document.querySelector('.mapid_clean');
//let lati = response_smat_map[0].user_latitude;
//let long = response_smat_map[0].user_longtitude;
let new_cur_pos_marker_lat;
let new_cur_pos_marker_lng;
let mapid_alert = document.querySelector('.mapid_alert');
let mapid_whereI = document.querySelector('.mapid_whereI');

//if(response_smat_map[0].user_latitude != null){
//	let lati = +response_smat_map[0].user_latitude;
//	let long = +response_smat_map[0].user_longtitude;

	let lati;
	let long;



if(get_position){
get_position.addEventListener('click', ()=>{
	get_cur_position();
});
}


function get_cur_position(){

navigator.geolocation.getCurrentPosition(
    function(position) {
	   
		
		if (response_smat_map.some(e => e.user_uuid === userIdFrom && e.user_latitude!=null)) {
  		console.log(response_smat_map);
		for(let i=0;i<response_smat_map.length;i++){
			if(response_smat_map[i].user_uuid == userIdFrom){
				lati = +response_smat_map[i].user_latitude;
				long = +response_smat_map[i].user_longitude;
				console.log(lati, long);
				show_smart_map(lati, long)
			}
		}
		}else{
			lati = position.coords.latitude;
	    	long = position.coords.longitude;
			show_smart_map(lati, long)
		}
		
		
		//show_smart_map(lati, long)
		console.log(lati, long)
    },
    function(error){
	    /*if(response_smat_map[0].user_latitude != null){
			lati = +response_smat_map[0].user_latitude;
			long = +response_smat_map[0].user_longitude;
		    show_smart_map(lati, long);
		}*/
		if (response_smat_map.some(e => e.user_uuid === userIdFrom && e.user_latitude!=null)) {
  		console.log(response_smat_map);
		for(let i=0;i<response_smat_map.length;i++){
			if(response_smat_map[i].user_uuid == userIdFrom){
				lati = +response_smat_map[i].user_latitude;
				long = +response_smat_map[i].user_longitude;
				console.log(lati, long);
				show_smart_map(lati, long)
			}
		}
		}
		else{
			lati = 53.89948354993688;
			long = 27.557659149169925;
			show_smart_map(lati, long);
	    	mapid_whereI.style.display = 'none';
			console.log(lati, long);
		}
    }
);

}

function show_smart_map(lati, long){
	
	map_container.style.display = "block";
	if(document.querySelector('#mapid').hasChildNodes()){}
	else{
		console.log(response_smat_map);
		if(response_smat_map[0].user_latitude != null){
			/*let lati = +response_smat_map[0].user_latitude;
			let long = +response_smat_map[0].user_longitude;*/
			for(let i=0;i<response_smat_map.length;i++){
			if(response_smat_map[i].user_uuid == userIdFrom){
				let lati = +response_smat_map[i].user_latitude;
				let long = +response_smat_map[i].user_longitude;
				console.log(lati, long);
			}
		}
		}
		
	
		
	mapid = L.map('mapid').setView([lati, long], 13);
		
	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmlraXRhbGFzdCIsImEiOiJja3UwYmtnbjYwOWo0MnZvMTJ3ZTRiY3ZhIn0.5YnAsUvxjkv-oyTUmD-Kxw', {
    		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    		maxZoom: 18,
    		id: 'mapbox/streets-v11',
    		tileSize: 512,
    		zoomOffset: -1,
    		accessToken: 'pk.eyJ1IjoibmlraXRhbGFzdCIsImEiOiJja3UwYmtnbjYwOWo0MnZvMTJ3ZTRiY3ZhIn0.5YnAsUvxjkv-oyTUmD-Kxw'
	}).addTo(mapid);
	var marker = L.marker([lati, long]).addTo(mapid);
	let new_cur_pos_marker;
	function onMapClick(e) {
    		marker.setLatLng(e.latlng)
        	new_cur_pos_marker = marker.getLatLng();
		new_cur_pos_marker_lat = new_cur_pos_marker.lat;
		new_cur_pos_marker_lng = new_cur_pos_marker.lng;
        		
		
		
		
		mapid_whereI.addEventListener('click', ()=> {
		navigator.geolocation.getCurrentPosition(
    			function(position) {
	    			lati = position.coords.latitude;
	    			long = position.coords.longitude;
				marker.setLatLng([lati, long]);
				new_cur_pos_marker = marker.getLatLng();
				new_cur_pos_marker_lat = new_cur_pos_marker.lat;
				new_cur_pos_marker_lng = new_cur_pos_marker.lng;
	    		},
    			function(error){
	    			show_smart_map(53.89948354993688, 27.557659149169925);
				mapid_whereI.style.display = 'none';
    			}
			);
		});
		
		
		
	}
	}
	console.log('before ' + lati, long);
	
	
	
	
	
	mapid.on('click', onMapClick);
	mapid_close.addEventListener('click', ()=> {
		map_container.style.display = "none";
	});
	
}

document.querySelector(".mapid_send").addEventListener("click", function(){
	var form = new FormData();
	form.append("uuid", `${userIdFrom ? userIdFrom : getCookie("auth_token")}`);
	form.append("latitude", `${new_cur_pos_marker_lat ? new_cur_pos_marker_lat : lati||lati!=null ? lati : 50.0208504}`);	
	form.append("longitude", `${new_cur_pos_marker_lng ? new_cur_pos_marker_lng : long||long!=null ? long : 36.2296937}`);
	var settings = {
  		"url": `${new_settapi}api/profile`,
  		"method": "PUT",
  		"timeout": 0,
  		"headers": {
  		  "Authorization": `Token ${getCookie("auth_token")}`
  		},
  		"processData": false,
  		"mimeType": "multipart/form-data",
  		"contentType": false,
  		"data": form
	};

	$.ajax(settings).done(function (response) {
  		console.log(response);
		mapid_alert.style.display = "block";
		setTimeout(function(){
			mapid_alert.style.transition = "1s";
			mapid_alert.style.opacity = "1";
		}, 200);
		setTimeout(function(){
			mapid_alert.style.transition = "1s";
			mapid_alert.style.opacity = "0";
		}, 2500);
		setTimeout(function(){
	
			window.location.reload();
		}, 3500)
	});
});

document.querySelector(".mapid_clean").addEventListener("click", function(){
	var form = new FormData();
	form.append("uuid", `${userIdFrom ? userIdFrom : getCookie("auth_token")}`);
	form.append("latitude", '');	
	form.append("longitude", '');
	var settings = {
  		"url": `${new_settapi}api/profile`,
  		"method": "PUT",
  		"timeout": 0,
  		"headers": {
  		  "Authorization": `Token ${getCookie("auth_token")}`
  		},
  		"processData": false,
  		"mimeType": "multipart/form-data",
  		"contentType": false,
  		"data": form
	};

	$.ajax(settings).done(function (response) {
  		console.log(response);
		setTimeout(function(){
			window.location.reload();
		},1000)
	});
});

//ключи, желания, возможности

var rootDialog = document.getElementById("rootDialog");
var addElementDialog = document.getElementById("addElementDialog");
var rootList = document.getElementById("rootList");
var rootAddElementMenu = document.getElementById("rootAddElementMenu");
var addElement = document.getElementById("addElement");
var elementAddInput = document.getElementById("elementAddInput");
var keyTypesBtns = document.getElementById("keyTypesBtns");


function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
	});
}

rootAddElementMenu.addEventListener("click", () => {
	elementAddInput.value = "";
	elementAddInput.id = "elementAddInput";
	addElementDialog.style.display = "flex";
})


addElement.addEventListener("click", async () => {
	var fetchSettings
	if (elementAddInput.getAttribute(`category`) == 'keys') {
		fetchSettings = {
			apiurl: "",
			body: {
				user_uuid: dynamic_id,
				value: elementAddInput.value,
				type_id: elementAddInput.getAttribute("keytype")
			}
		}
		if (elementAddInput.getAttribute("operation")) {
			fetchSettings.apiurl = "updatekey"
			fetchSettings.body['id'] = elementAddInput.id
		} else {
			fetchSettings.apiurl = "addkey"
		}
	}
	else if (elementAddInput.getAttribute(`category`) == 'wishes') {
		fetchSettings = {
			apiurl: "addorupdatewish",
			body: {
				"user_uuid": dynamic_id,
				"uuid": elementAddInput.id != "elementAddInput" ? elementAddInput.id : uuidv4(),
				"text": elementAddInput.value,
				"last_edit": Math.floor(new Date().getTime()/1000)
			}
		}
	}
	else if (elementAddInput.getAttribute(`category`) == 'abilities') {
		fetchSettings = {
			apiurl: "addorupdateability",
			body: {
				"user_uuid": dynamic_id,
				"uuid": elementAddInput.id != "elementAddInput" ? elementAddInput.id : uuidv4(),
				"text": elementAddInput.value,
				"last_edit": Math.floor(new Date().getTime()/1000)
			}
		}
		
	}

	if (elementAddInput.value != "") {
		const response = await fetch(`${settings.api}api/${fetchSettings.apiurl}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Token ${getCookie("auth_token")}`
			},
			body:  JSON.stringify(fetchSettings.body)
		})
		console.log(fetchSettings);
		//window.location.reload();
		rootDialog.style.display = 'none';
		addElementDialog.style.display = "none";
	} else {
		elementAddInput.placeholder = "Введите что-то!"
	}
});

// edit wish buttons
[...document.getElementsByClassName("keytype")].forEach(button => {
	button.addEventListener("click", () => {
		elementAddInput.setAttribute("keytype", button.getAttribute("id"))
	})
})

document.getElementById("keys").addEventListener("click", async () => {
	await rootFunctions('keys')
})

document.getElementById("abilities").addEventListener("click", async () => {
	await rootFunctions('abilities')
})

document.getElementById("wishes").addEventListener("click", async () => {
	await rootFunctions('wishes')
})

async function rootFunctions(category) {
	var categoryObj;
	if (category == 'wishes') {
		categoryObj = {
			apiurl: 'getuserwishes',
			delete: 'deletewish?uuid=',
			id: 'uuid',
			value: 'text',
			empty: 'желаний'
		};
		elementAddInput.setAttribute("placeholder", "Желание...");
		elementAddInput.setAttribute("category", category);
	}
	else if (category == 'keys') {
		categoryObj = {
			apiurl: 'getuserkeys',
			delete: 'deletekey?id=',
			id: 'id',
			value: 'value',
			type: 'type_id',
			empty: 'ключей'
		};
		elementAddInput.setAttribute("placeholder", "Ключ...");
		elementAddInput.setAttribute("category", category);
	}
	else {
		categoryObj = {
			apiurl: 'getuserabilities',
			delete: 'deleteability?uuid=',
			id: 'uuid',
			value: 'text',
			empty: 'возможностей'
		};
		elementAddInput.setAttribute("placeholder", "Возможность...");
		elementAddInput.setAttribute("category", category);
	}


	var root = await getElements(categoryObj.apiurl)
	root = root[category]
		if (root.length == 0) {
			rootList.innerHTML = `<li> У вас пока что нет ${categoryObj.empty} </li>`
		} else {
			rootList.innerHTML = ""
			root.forEach(wish => {
				rootList.innerHTML += `<li id="${wish[categoryObj.id]}" value="${wish[categoryObj.value]}" typekey="${categoryObj.type ? wish[categoryObj.type] : 0}">${wish[categoryObj.value]}<button class="editElement btn btn-success">Ред.</button> <button class="deleteWish btn btn-danger">Уд.</button> </li>`
			})
		};

		[...document.getElementsByClassName("editElement")].forEach(button => {
			button.addEventListener("click", () => {
				elementAddInput.id = button.parentElement.id;
				elementAddInput.setAttribute("keytype", button.parentElement.getAttribute("typekey"));
				elementAddInput.setAttribute("operation", "edit");
				elementAddInput.setAttribute("category", category);
				elementAddInput.value = button.parentElement.getAttribute("value");

				addElementDialog.style.display = "flex";
			})
		});

		[...document.getElementsByClassName("deleteWish")].forEach(button => {
			button.addEventListener("click", async () => {
				await deleteElement(button.parentElement.id, categoryObj.delete);
				//window.location.reload();
				rootDialog.style.display = 'none';
				addElementDialog.style.display = "none";
			})
		});

		categoryObj.type ? keyTypesBtns.style.display = "flex" : keyTypesBtns.style.display = "none";
		rootDialog.style.display = "flex";
}

async function getElements(apiurl) {
	const response = await fetch(`${settings.api}api/${apiurl}?uuid=${dynamic_id}`, {
		method: "GET"
	}).then(data => data.json())
	return response
}

async function deleteElement(uuid, apiurl) {
	const response = await fetch(`${settings.api}api/${apiurl}${uuid}`, {
		method: "GET",
		headers: {
			"Authorization": "Token " + getCookie("auth_token")
		}
	}).then(data => data.json())
}

[...document.getElementsByClassName("close")].forEach(button => {
	button.addEventListener("click", () => {
		button.parentElement.style.display = "none";
	});
});

setInterval(function(){
	if(document.querySelector('#addElementDialog').style.display == 'flex'){
		let buttons_cont = document.querySelector('#addElementDialog #keyTypesBtns');
		if (buttons_cont.hasChildNodes()) {
  			var children = buttons_cont.childNodes;
		
  			for (var i = 0; i < children.length; ++i) {
						
    				let d = document.querySelector('#addElementDialog .form-control').attributes.keytype.nodeValue;
				if (children[i].id != d){
							children[i].style = 'background: #6c757d';
						}
				else {
					children[i].style = 'background: #6be86b;box-shadow: rgb(142 198 60 / 40%) 0px 0px 10px 9px;'
				}
  				}
			}
		}
	else {
		
	}

}, 1000);


//Добавить картинку род

let gen_container = document.querySelector('.gen_container');
let div = document.createElement('div');
div.style.position = 'relative';
div.innerHTML = `<img src="${settings.url}images/genesis.png" /><img src="${settings.url}gen/?id=${getCookie('user_uuid')}" />`;
gen_container.append(div);

//кнопка род

gen_container.addEventListener('click', function(){
	window.location.href = window.location.origin + '/gen/?id=' + getCookie("user_uuid");
})


