var link = window.location.href;
var url = new URL(link);

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








let user_table_body = document.querySelector('#user_table_body');

async function myProfilesinfo() {
		const response = await fetch(`${settings.api}api/profile`, {
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
		
		tr.innerHTML = `<td><img src='${response[i].photo=="" ? settings.url+"/images/default_avatar.png" : response[i].photo}'/></td><td>${response[i].last_name + ' ' + response[i].first_name + ' ' + response[i].middle_name}</td><td><div class="bd_dd"><div class="bd_dd_cont"><p>${response[i].dob != null ? response[i].dob : ''}</p><p>|</p><p>${response[i].dod != null ? response[i].dod : ''}</p></div><div class="user_changed"><a class="user_changed_link" href="${window.location.origin}/?id=${response[i].uuid}&q=50&f=0"><i class="fa fa-link" aria-hidden="true"></i></a><div class="user_changed_info" onclick="user_changed_info('${response[i].uuid}', '${response[i].last_name}', '${response[i].first_name}', '${response[i].middle_name}', '${response[i].photo}', '${response[i].dob}', '${response[i].dod}')"><img src="${settings.url}images/pen.png"></div></div></div></td>`;
		user_table_body.append(tr); 
	}
}

window.onload = myProfilesinfo();






//редактировать профиль
function user_changed_info(id, last_name, first_name, middle_name, usr_photo, dob, dod){
	let add_user_profile_container = document.querySelector('.add_user_profile_container');
	let add_user_profile_close_popup = document.querySelector('.add_user_profile_close_popup');
	let user_profile_surname_inp = document.querySelector('.user_profile_surname_inp');
	let user_profile_name_inp = document.querySelector('.user_profile_name_inp');
	let user_profile_middlename_inp = document.querySelector('.user_profile_middlename_inp');
	let add_user_profile_photo = document.querySelector('.add_user_profile_photo');
	let add_user_profile_overbottom = document.querySelector('.add_user_profile_overbottom');
	let add_user_profile_bd = document.querySelector('.add_user_profile_bd');
	let add_user_profile_dd = document.querySelector('.add_user_profile_dd');
	let add_user_profile_mother_input = document.querySelector('.add_user_profile_mother_input');
	let add_user_profile_father_input = document.querySelector('.add_user_profile_father_input');
	
	
	
	
	
	
	//обрезка файлов
	var bs_modal = $('#modal');
    var image = document.getElementById('image');
    var cropper,reader,file;
   

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
            viewMode: 3,
            preview: '.preview'
        });
    }).on('hidden.bs.modal', function() {
        cropper.destroy();
        cropper = null;
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
  					"url": `${settings.api}api/profile`,
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
	
	//конец
	
	user_profile_surname_inp.value = last_name;
	user_profile_name_inp.value = first_name;
	user_profile_middlename_inp.value = middle_name;
	add_user_profile_bd.value = dob;
	add_user_profile_dd.value = dod;
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
				if(response.connections[i].target == id && response.connections[i].is_mother == true){
					add_user_profile_mother_input.value = response.connections[i].source;
				}
				else if(response.connections[i].target == id && response.connections[i].is_father == true){
					add_user_profile_father_input.value = response.connections[i].source;
				}
			}
	}
	getUsparent()
	
	
	//Кнопка Сохранить
	add_user_profile_overbottom.addEventListener('click', function(){
		
		
		
		
		
		async function add_user_parents(operation_type_id, add_user_profile_mother_input){
		const response = await fetch(`${settings.api}api/addoperation`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Token ${getCookie("auth_token")}`
		},
		body: JSON.stringify({"user_id_from": add_user_profile_mother_input, "user_id_to": id, "operation_type_id": operation_type_id})
	}).then(data => data.json());
			console.log(add_user_profile_mother_input, id, operation_type_id);
}
		
		
		async function myProfilesinfo() {
		const response = await fetch(`${settings.api}api/profile_genesis?uuid=${getCookie('user_uuid')}&depth=100`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
}).then(data => data.json());		
			//var b;
			if(add_user_profile_mother_input.value.includes('id')){
				let str = add_user_profile_mother_input.value;
					//Обрезаем конец:
				var from = str.search('id=') + 3; 
				var to = str.length;
				let newstr = str.substr(from,to);
				console.log(newstr);
				add_user_profile_mother_input.value = newstr;
			}
			//var b;
			if(add_user_profile_father_input.value.includes('id')){
				let str3 = add_user_profile_father_input.value;
					//Обрезаем конец:
				var from3 = str3.search('id=') + 3; 
				var to3 = str3.length;
				let newstr3 = str3.substr(from3,to3);
				console.log(newstr3);
				add_user_profile_father_input.value = newstr3;
			}
			console.log(response);
			let users_resp = [];
			for(let i = 0; i<response.connections.length; i++){
				if(response.connections[i].target == id){
					if(response.connections[i].source == add_user_profile_mother_input.value && response.connections[i].target == id && response.connections[i].source == add_user_profile_father_input.value && response.connections[i].target == id){
					   console.log('То же что и было');
					}else{
						if(add_user_profile_mother_input.value!= '' && response.connections[i].is_mother == true){
						add_user_parents(7, response.connections[i].source);
						add_user_parents(8, add_user_profile_mother_input.value);
						}
						if(add_user_profile_mother_input.value!= '' && response.connections[i].is_mother == false){
							add_user_parents(8, add_user_profile_mother_input.value);
						}
						if(add_user_profile_mother_input.value == '' && response.connections[i].is_mother == true){
							add_user_parents(7, response.connections[i].source);
						}
						//father
						if(add_user_profile_father_input.value!= '' && response.connections[i].is_father == true){
						add_user_parents(7, response.connections[i].source);
						add_user_parents(6, add_user_profile_father_input.value);
						}
						if(add_user_profile_father_input.value!= '' && response.connections[i].is_father == false){
							add_user_parents(6, add_user_profile_father_input.value);
						}
						if(add_user_profile_father_input.value == '' && response.connections[i].is_father == true){
							add_user_parents(7, response.connections[i].source);
						}
						
						/*else if(add_user_profile_father_input.value!= '' && response.connections[i].is_father == true){
							add_user_parents(7, response.connections[i].source);
							add_user_parents(8, add_user_profile_father_input.value);
						}*/
					}
				}
				else{
					/*add_user_parents(8, add_user_profile_mother_input.value);
					console.log(add_user_profile_mother_input.value)*/
					users_resp.push('none');
				}
			}
			
			if(response.connections.length == users_resp.length){
				if(add_user_profile_father_input.value!= ''){
					add_user_parents(6, add_user_profile_father_input.value)
				}
				if(add_user_profile_mother_input.value!= ''){
					add_user_parents(8, add_user_profile_mother_input.value)
				}
				console.log(users_resp);
				//add_user_parents(8, add_user_profile_mother_input.value)
			}
		}
		myProfilesinfo();
		
		
		//add_user_parents(7);
		//add_user_parents(6);
		
		
		
		
		
		var formdata = new FormData();
		formdata.append("uuid", id);
		formdata.append("first_name", user_profile_name_inp.value);
		formdata.append("last_name", user_profile_surname_inp.value);
		formdata.append("middle_name", user_profile_middlename_inp.value);
		formdata.append("dob", add_user_profile_bd.value);
		formdata.append("dod", add_user_profile_dd.value);
		async function add_gen(){
		const response = await fetch(`${settings.api}api/profile`, {
		method: "PUT",
		headers: {
			"Authorization": `Token ${getCookie("auth_token")}`
		},
		body: formdata
	}).then(response => response.ok ? response.text() /*&& window.location.reload()*/ : console.log('bad'))
	.then(result => console.log(result))
	.catch(error => console.log('error', error));
	
	
}
		add_gen();
		
		
		
	});
	
	
	
	
	//закрыть попап
	add_user_profile_close_popup.addEventListener('click', function(){
		if(user_profile_surname_inp.value != last_name || user_profile_name_inp.value != first_name || user_profile_middlename_inp.value != middle_name || add_user_profile_bd.value != dob || add_user_profile_dd.value != dod){
			let user_profile_not_save = confirm('Есть несохранённые данные. Всё равно закрыть?');
			if(user_profile_not_save == true){
				window.location.reload();
			}else{
				/*var formdata = new FormData();
						formdata.append("uuid", id);
						formdata.append("first_name", user_profile_name_inp.value);
						formdata.append("last_name", user_profile_surname_inp.value);
						formdata.append("middle_name", user_profile_middlename_inp.value);
						formdata.append("dob", add_user_profile_bd.value);
						formdata.append("dod", add_user_profile_dd.value);
						async function add_gen(){
						const response = await fetch(`${settings.api}api/profile`, {
						method: "PUT",
						headers: {
							"Authorization": `Token ${getCookie("auth_token")}`
						},
						body: formdata
					}).then(response => response.ok ? response.text() && window.location.reload() : console.log('bad'))
					.then(result => console.log(result))
					.catch(error => console.log('error', error));
				}
				add_gen();*/
			}
		}else{
		window.location.reload();
		}
	})
	
}


//Добавить новый профиль
let add_profile_but = document.querySelector('.add_profile_but');
let add_user_profile_container_prew = document.querySelector('.add_user_profile_container_prew');
add_profile_but.addEventListener('click', function(){
	add_user_profile_container_prew.style.display = 'block';
	let add_user_profile_close_popup = document.querySelector('.add_user_profile_close_popup');	
	let user_profile_surname_inp = document.querySelector('.user_profile_surname_inp');
	let user_profile_name_inp = document.querySelector('.user_profile_name_inp');
	let add_user_profile_overbottom = document.querySelector('.add_user_profile_overbottom');
	/*let user_profile_middlename_inp = document.querySelector('.user_profile_middlename_inp');
	let add_user_profile_bd = document.querySelector('.add_user_profile_bd');
	let add_user_profile_dd = document.querySelector('.add_user_profile_dd');
	let add_user_profile_mother_input = document.querySelector('.add_user_profile_mother_input');
	let add_user_profile_father_input = document.querySelector('.add_user_profile_father_input');
	let new_uuid;
	var formdata = new FormData();*/
	
	
	let new_api_str = settings.api;
	
	//закрыть попап
	add_user_profile_close_popup.addEventListener('click', function(){
		if(user_profile_surname_inp.value != '' || user_profile_name_inp.value != '' || user_profile_middlename_inp.value != '' || add_user_profile_bd.value != '' || add_user_profile_dd.value != '' || add_user_profile_mother_input.value != '' || add_user_profile_father_input.value != ''){
			let user_profile_not_save = confirm('Есть несохранённые данные. Всё равно закрыть?');
			if(user_profile_not_save == true){
				window.location.reload();
			}
		}else{
		window.location.reload();
		}
	})
	
	//Создание юида
	//add_user_profile_overbottom.addEventListener('click', function(){
			
		
	
		
		var form = new FormData();
	if(user_profile_name_inp.value != ''){
	form.append("first_name", user_profile_name_inp.value);
	}
	if(user_profile_surname_inp.value != ''){
		form.append("last_name", user_profile_surname_inp.value);
	}
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
						let str = response;
						let pars = JSON.parse(str);
						new_uuid = pars.uuid;
						
						
							
						/*formdata.append("uuid", new_uuid);
						formdata.append("first_name", user_profile_name_inp.value);
						formdata.append("last_name", user_profile_surname_inp.value);
						formdata.append("middle_name", user_profile_middlename_inp.value);
						formdata.append("dob", add_user_profile_bd.value);
						formdata.append("dod", add_user_profile_dd.value);
						add_detail_profile_info()*/
					},
					error: function(response){
						let str1 = response;
						let pars1 = JSON.parse(str);
						console.log(pars1);
					}
					};

					$.ajax(settings).done(function (response) {
						
						//new_uuid = response.uuid;
						//console.log(new_uuid);
						//console.log(response);
						//console.log(response[0]);
						//console.log(typeof(response));
						
					});
		
					
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











//Добавить картинку род

let gen_container = document.querySelector('.gen_container');
let div = document.createElement('div');
div.innerHTML = `<img src="${settings.url}images/genesis.png" />`;
gen_container.append(div);

//кнопка род

gen_container.addEventListener('click', function(){
	window.location.href = window.location.origin + '/gen';
})


