jQuery(document).ready(function($) {
    $('#seo-opt-test-connection').on('click', function(e) {
        e.preventDefault();
        var $btn = $(this);
        var originalText = $btn.text();
        
        $btn.text(seoOptAgentObj.saving_text).prop('disabled', true);
        $('#seo-opt-notices-container').html('');
        
        $.post(seoOptAgentObj.ajax_url, {
            action: 'seo_opt_test_connection',
            nonce: seoOptAgentObj.nonce
        }, function(response) {
            var noticeClass = response.success ? 'notice-success' : 'notice-error';
            var html = '<div class="notice ' + noticeClass + ' is-dismissible"><p>' + response.data.message + '</p></div>';
            $('#seo-opt-notices-container').html(html);
            
            // Update UI elements
            $('#seo-opt-status-text').text(response.data.status);
            if (response.success) {
                $('#seo-opt-last-success').text(response.data.last_success);
                $('#seo-opt-last-error').text('None').css('color', 'inherit');
            } else {
                $('#seo-opt-last-error').text(response.data.last_error || 'Unknown Error').css('color', '#d63638');
            }
        }).fail(function() {
            $('#seo-opt-notices-container').html('<div class="notice notice-error is-dismissible"><p>Network error occurred.</p></div>');
        }).always(function() {
            $btn.text(originalText).prop('disabled', false);
        });
    });

    // Prevent saving masked password
    $('form').on('submit', function() {
        var $apiKey = $('#seo_opt_api_key');
        if ($apiKey.val().indexOf('****') !== -1) {
            $apiKey.prop('disabled', true); // Prevent sending masked value
        }
    });
});\n