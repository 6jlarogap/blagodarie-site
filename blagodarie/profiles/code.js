var link = window.location.href;
var url = new URL(link);

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}



let user_table_body = document.querySelector('#user_table_body');

async function myProfilesinfo() {
		const response = await fetch(`https://api.dev.blagodarie.org/api/profile_genesis?uuid=` + url.searchParams.get('id'), {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
}).then(data => data.json());
	console.log(response);
	for(let i = 0; i<response.users.length; i++){
		console.log(response.users[i]);
		let tr = document.createElement('tr');
		tr.innerHTML = `<td><img src='${response.users[i].photo==''? "https://dev.blagodarie.org/images/default_avatar.png" : response.users[i].photo}' /></td><td>${response.users[i].last_name + ' ' + response.users[i].first_name + ' ' + response.users[i].middle_name}</td><td>Нет данных</td>`;
		user_table_body.append(tr); 
	}
}

window.onload = myProfilesinfo();
	

