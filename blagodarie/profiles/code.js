var link = window.location.href;
var url = new URL(link);

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}



let user_table_body = document.querySelector('#user_table_body');
let tr = document.createElement('tr');
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
		tr.innerHTML = "<td>1</td><td>2</td><td>3</td>";
		user_table_body.append(tr); 
	}
}

window.onload = myProfilesinfo();
	

