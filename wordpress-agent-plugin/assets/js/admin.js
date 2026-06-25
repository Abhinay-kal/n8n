jQuery(document).ready(function($) {
    function handleAction($btn, actionName) {
        var originalText = $btn.text();
        $btn.text(seoOptAgentObj.loading_text).prop('disabled', true);
        $('#seo-opt-notices-container').html('');
        
        $.post(seoOptAgentObj.ajax_url, {
            action: actionName,
            nonce: seoOptAgentObj.nonce
        }, function(response) {
            var noticeClass = response.success ? 'notice-success' : 'notice-error';
            var html = '<div class="notice ' + noticeClass + ' is-dismissible"><p>' + response.data.message + '</p></div>';
            $('#seo-opt-notices-container').html(html);
            
            $('#seo-opt-status-text').text(response.data.status);
            $('#seo-opt-reg-text').text(response.data.reg_status);
            $('#seo-opt-backend-version').text(response.data.backend_version);
            $('#seo-opt-api-version').text(response.data.api_version);
            $('#seo-opt-protocol-version').text(response.data.protocol_version);
            $('#seo-opt-capabilities').text(response.data.capabilities);
            
            if (response.success) {
                $('#seo-opt-last-error').text('None').css('color', 'inherit');
            } else {
                $('#seo-opt-last-error').text(response.data.last_error || 'Unknown Error').css('color', '#d63638');
            }
        }).fail(function() {
            $('#seo-opt-notices-container').html('<div class="notice notice-error is-dismissible"><p>Network error occurred.</p></div>');
        }).always(function() {
            $btn.text(originalText).prop('disabled', false);
        });
    }

    $('#seo-opt-handshake').on('click', function(e) {
        e.preventDefault();
        handleAction($(this), 'seo_opt_handshake');
    });

    $('#seo-opt-register').on('click', function(e) {
        e.preventDefault();
        handleAction($(this), 'seo_opt_register');
    });

    $('#seo-opt-disconnect').on('click', function(e) {
        e.preventDefault();
        handleAction($(this), 'seo_opt_disconnect');
    });

    $('form').on('submit', function() {
        var $apiKey = $('#seo_opt_api_key');
        if ($apiKey.val().indexOf('****') !== -1) {
            $apiKey.prop('disabled', true);
        }
    });
});\n