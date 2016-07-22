function getHeaderAndFooter() {
  // load site data from meta.json and populate banner
  $.getJSON('meta.json', function (data) {
    var site = data;
    document.getElementById('site-title').innerHTML = site.title;
    document.getElementById('page-footer').innerHTML = (site.footer_copyright + ' ' + site.author + '. ' + site.footer_license);
  });
};

function getLoggedOutNavbar() {
  $.get('includes/navbar_loggedout.html', function (data) {
    var navbarContent = data;
    document.getElementById('navbar').innerHTML = navbarContent;
  });
};

function getLoggedInNavbar() {
  $.get('includes/navbar_loggedin.html', function (data) {
    var navbarContent = data;
    document.getElementById('navbar').innerHTML = navbarContent;
  });
};

function getIndexContent() {
  // load syllabus data from site_content.json and populate page
  $.getJSON('site_content.json', function (data) {
    var siteContent = data;
    if (sessionStorage.token) {
      getLoggedInNavbar();
    } else {
      getLoggedOutNavbar();
    };
    document.getElementById('page-heading').innerHTML = siteContent.title;
    document.getElementById('page-subheading').innerHTML = siteContent.author;
    document.getElementById('page-content').innerHTML = siteContent.content;
    document.getElementById('title-edit-label').innerHTML = '';
    document.getElementById('author-edit-label').innerHTML = '';
    document.getElementById('content-edit-label').innerHTML = '';
  });
};

// opens edit page, loads data from database for editing
function getEditForm() {
  $.ajax({
    headers: { 'Authorization': ('Bearer ' + sessionStorage.token)},
    type: 'GET',
    url: 'edit_content.php',
    success: function (data) {
      var editFormContent = data;
      document.getElementById('page-heading').innerHTML = '';
      document.getElementById('page-subheading').innerHTML = '';
      document.getElementById('page-content').innerHTML = editFormContent.form_content;
      //document.getElementById('title-edit-label').innerHTML = 'title:';
      //document.getElementById('author-edit-label').innerHTML = 'author:';
      //document.getElementById('content-edit-label').innerHTML = 'content:';
      document.getElementById('content-edit-label').innerHTML = 'click to edit:';
      document.getElementById('title-edit-label').style = 'text-align: right;';
      document.getElementById('author-edit-label').style = 'text-align: right;';
      document.getElementById('content-edit-label').style = 'text-align: right; color: #7B7D7D;';

      // load page data from site_content.json and populate form
      $.getJSON('site_content.json', function (data) {
        var siteContent = data;
        document.getElementById('editContentTitle').innerHTML = siteContent.title;
        document.getElementById('editContentAuthor').innerHTML = siteContent.author;
        document.getElementById('editPageContent').innerHTML = siteContent.content;
        editor = new MediumEditor('.editable');
        editor.subscribe('editableInput', function (event, editable) {
          bodyContentInput = editable.innerHTML;
        });
        editor.addElements(document.getElementsByClassName('editable'));
      });

    }
  })
};

function getImportForm() {
  // get navbar from navbar.html and load into html
  $.ajax({
    headers: { 'Authorization': ('Bearer ' + sessionStorage.token)},
    type: 'GET',
    url: 'import_content.php',
    success: function (data) {
      var importFormContent = data;
      document.getElementById('page-content').innerHTML = importFormContent.form_content;
    }
  })
};

// collect document information from edit form`and write to database
function collectContent() {
  var allContent = editor.serialize();
  var title = allContent.editContentTitle.value;
  var author = allContent.editContentAuthor.value;
  var content = bodyContentInput;

  var post_object = {
    "index": "1",
    "timestamp": "",
    "feature_image": "",
    "image_credit_url": "",
    "image_credit_photographer": "",
    "author": author,
    "title": title,
    "content": content
  }
  var post_object_string = JSON.stringify(post_object);

  // write form content to file
  // send data to local (PHP) script which will write to file

  $.ajax({
  type: 'POST',
  url: './save_file.php',
  data: { data: post_object_string },
  success: getIndexContent(),
  dataType: 'application/json'
});

  event.preventDefault();
};

function loginToSite() {
  var username = document.loginform.username.value;
  var password = document.loginform.password.value;

  var login_object = {
    "action": "authenticate",
    "username": username,
    "password": password
  }
  var login_object_string = JSON.stringify(login_object);

  // send login info to PHP API

  $.ajax({
  type: 'POST',
  url: './secure.php',
  data: { data: login_object_string },
  dataType: 'json',
  success: function(returnedData) {
    //alert(text);
    sessionStorage.token = returnedData.jwt;
    getEditForm();
    getLoggedInNavbar();
  },
  error: function (jqXHR, textStatus, errorThrown) {
              delete sessionStorage.token;
              alert("jqXHR: " + jqXHR.status + "\ntextStatus: " + textStatus + "\nerrorThrown: " + errorThrown);
            }
});

  event.preventDefault();
};

function logout() {
  delete sessionStorage.token;
  getLoggedOutNavbar();
  getIndexContent();
};

// get URL of syllabus to clone from user,
// fetch data, then go to edit page
function editFromURL() {
  var syllabusurl = (document.importurl.syllabusurl.value + '/api.php');

  // load syllabus data from database
  $.get(syllabusurl, function (data) {

      var syllabus = JSON.parse(data);

      var title = syllabus.title;
      var author = syllabus.author;
      var content = syllabus.content;

    var post_object = {
      "index": "1",
      "timestamp": "",
      "feature_image": "",
      "image_credit_url": "",
      "image_credit_photographer": "",
      "author": author,
      "title": title,
      "content": content
    }
    var post_object_string = JSON.stringify(post_object);

    // write form content to file
    // send data to local (PHP) script which will write to file

    $.ajax({
    type: 'POST',
    url: './save_file.php',
    data: { data: post_object_string },
    success: getEditForm(),
    dataType: 'application/json'
    });
  });

  event.preventDefault();
};

function getLoginForm() {
  $.get('includes/login_form.html', function (data) {
    var importFormContent = data;
    document.getElementById('page-content').innerHTML = importFormContent;
  });
};



// The following code can be used as the skeleton of a blog format, rather than a single page
// this is old code that needs tweaking in light of updates to the js

/*
window.onload = function() {
  var post_list_content = '';

  // post a single page if asked via URL query
  if (urlObject().parameters['p']) {
    var i = urlObject().parameters['p'] - 1;
    post_list_content += '<h1>';
    post_list_content += content.posts[i].title;
    post_list_content += '</h1>\n<h2>by ';
    post_list_content += content.posts[i].author;
    post_list_content += '</h2>\n<br/>';
    post_list_content += content.posts[i].text;
    post_list_content += '\n<br/><hr/><br/>';
  } else {

  // post all pages in reverse index order (need to change to timestamps and reverse chronological order)
    for(i = content.posts.length - 1; i >= 0; i -= 1) {
      post_list_content += '<h1><a href="';
      post_list_content += site.url;
      post_list_content += '?p=';
      post_list_content += (content.posts[i].index);
      post_list_content += '">';
      post_list_content += content.posts[i].title;
      post_list_content += '</a></h1>\n<h2>by ';
      post_list_content += content.posts[i].author;
      post_list_content += '</h2>\n<br/>';
      post_list_content += content.posts[i].text;
      post_list_content += '\n<br/><hr/><br/>';
  }
}

  document.getElementById('list-of-posts').innerHTML = post_list_content;
  document.getElementById('site-title').innerHTML = site.title;
  document.getElementById('banner-title').innerHTML = site.title;
  document.getElementById('site-author').innerHTML = 'by ' + site.author;
};
*/
