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
		tr.innerHTML = `<td><img src='${response[i].photo=="" ? settings.url+"/images/default_avatar.png" : response[i].photo}'/></td><td>${response[i].last_name + ' ' + response[i].first_name + ' ' + response[i].middle_name}</td><td>Нет данных</td>`;
		user_table_body.append(tr); 
	}
}

window.onload = myProfilesinfo();


//Добавить картинку род

let gen_container = document.querySelector('.gen_container');
let div = document.createElement('div');
div.innerHTML = `<img src="${settings.url}images/genesis.png" />`;
gen_container.append(div);

//кнопка род

gen_container.addEventListener('click', function(){
	window.location.href = window.location.origin + '/gen';
})


