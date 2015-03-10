function kaka(){
	alert("kaka");
	$.ajax("/usuario",{
		type: "GET",
		async: true,
		data: {idUsuario:"3"},
		dataType: "text",
		success: function(datos){
			alert("LGRADO");
			console.log(datos);
		},
		error: function(xhr,text,error){
			alert("error");
			console.log(text);
		}
	});
}