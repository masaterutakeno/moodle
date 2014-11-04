function urldecode(str) {
	return decodeURIComponent((str + '')
		.replace(/%(?![\da-f]{2})/gi, function() {
			return '%25';
		})
		.replace(/\+/g, '%20'));
}

var templates = [
    "root/externallib/text!root/plugins/mensagem/mensagens.html",
    "root/externallib/text!root/plugins/mensagem/mensagem_reply.html",
    "root/externallib/text!root/plugins/mensagem/lang/pt_br.json"
];

define(templates,function (mensagens, mensagem_reply, langStrings) {
    var plugin = {
        settings: {
            name: "mensagem",
            type: "general",
            menuURL: "#mensagem",
            lang: {
                component: "local_start",
                strings: langStrings
            },
            icon: "plugins/mensagem/icon.png"
        },
		
        routes: [
            ["mensagem", "mensagem_view_mensagens", "showMensagens"],			
            ["mensagem/:id/:subject/:mensagem", "mensagem_reply_mensagem", "replyMensagens"]
        ],

		showMensagens: function() {
			userid = MM.config.current_site.userid;
			
            MM.panels.showLoading('center');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
			// Adding loading icon.
            $('a[href="#mensagem"]').addClass('loading-row');
			
            var data = {
                "dados[userid]" : MM.config.current_site.userid
            };
			
			MM.moodleWSextCall('local_start_get_messages', data, function(contents) {
                // Removing loading icon.
                $('a[href="#mensagem"]').removeClass('loading-row');
				
				var pageTitle = MM.lang.s("mensagens","mensagem");

                var tpl = {
					retorno: contents
                }
                var html = MM.tpl.render(MM.plugins.mensagem.templates.mensagens.html, tpl);
                MM.panels.show("center", html, {title: pageTitle});
            });	   
        },
        
        replyMensagens: function(id, subject, mensagem) {
			var pageTitle = MM.lang.s("mensagens","mensagem");

			var tpl = {
				tid: id,
				tsubject: subject,				
				tmensagem: urldecode(mensagem)
			}

			var html = MM.tpl.render(MM.plugins.mensagem.templates.mensagem_reply.html, tpl);
			MM.panels.show("right", html, {title: pageTitle});

			$("#form-mensagem-reply-update").on( "click", function() {
				MM.showModalLoading(MM.lang.s("salvando","mensagem"));
				
				var data = {
					"dados[id]" : id,
					"dados[userid]" : MM.config.current_site.userid,
					"dados[smallmessage]" : $("#form-mensagem-reply-mensagem").val()
				};

				MM.moodleWSextCall('local_start_reply_message', data, function(contents) {
					MM.refresh();
					MM.plugins.mensagem.showMensagens();
				});	 
			});
        },

        templates: {
            "mensagens": {
                html: mensagens
            },
            "mensagem_reply": {
                html: mensagem_reply
            }
        }
    }

    MM.registerPlugin(plugin);
});