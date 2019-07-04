(function (win, $, udf) {
  if (parent != window || self != top) {
    top.location.href = self.location.href;
  }


  function getAttr($this) {
    var model = $($this).attr('data-model');
    var type = $($this).attr('type').toLocaleLowerCase();
    return {model: model, type: type}
  }

  function showErrorMsg($container, data) {
    var msg = '';
    var $msg = $($container).find('.login-form__msg>.msg');
    if (typeof data === 'string') {
      msg = data
    } else {
      if (!data.name) {
        msg = '请输入您的用户名'
      } else if (data.name.length < 5 || data.name.length > 25) {
        msg = '账号长度支持5-25位字符'
      } else if (!data.pwd) {
        msg = '请输入您的密码'
      } else if (data.pwd.length < 6 || data.pwd.length > 20) {
        msg = '密码支持英文大小写和数字，6-20位'
      }
    }
    if (msg) {
      $msg.show().html('<b></b>' + msg);
    } else {
      $msg.hide().html('<b></b>' + msg)
    }
    return !!msg
  }

  function LoginForm(config) {

    if (!config) config = {};
    var formData = {}, $from = $('.form form');

    console.log($from)
    $from.find('[data-model]').each(function () {
      var attrConf = getAttr(this);
      if (attrConf.type === 'text' || attrConf.type === 'password') {
        formData[attrConf.model] = ''
      } else if (attrConf.type === 'checkbox') {
        formData[attrConf.model] = $(this).is(':checked')
      }
    });
    $from.find('[data-model]').on('input propertychange', function () {
      var attrConf = getAttr(this);
      if (attrConf.type === 'checkbox') {
        formData[attrConf.model] = $(this).is(':checked')
      } else {
        formData[attrConf.model] = $(this).val()
      }
    });

    $from.submit(function (e) {
      var resEr = showErrorMsg($from, formData);
      if (!resEr) {
        var scanToken = getQueryString('scan_token');
        var data = $.extend({scan_token: scanToken}, formData);
        $.post(config.action, data, function (res) {
          var msg = callback(res);
          if (msg !== undefined && typeof msg === 'string') {
            showErrorMsg($from, msg)
          } else if (res === 1) {
            showErrorMsg($from, '帐号或密码错误')
          } else if (res === 0) {
            showErrorMsg($from, '该账号无效或删除')
          } else {
            window.location.href = res
          }
        })
      }
      return false;
    });

    $from.find('#wechat_login').on('click', function () {
      win.location.href = '/OAuth/Wechat/Login?from_url=' + encodeURIComponent(location.href) + '&client_id=' + getQueryString('client_id');
    })
  }

  function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  }

  LoginForm.getQueryString = getQueryString;
  win['LoginForm'] = LoginForm
})(window, jQuery);





