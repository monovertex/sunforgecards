this["Templates"] = this["Templates"] || {};

this["Templates"]["components/article"] = function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_indent = [];
pug_mixins["iframe"] = pug_interp = function(url, classes){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\n";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003Ciframe" + (pug.attr("class", pug.classes(["iframe",classes], [false,true]), false, false)+pug.attr("src", url, true, false)+" frameborder=\"0\" scrolling=\"no\" allowtransparency=\"true\"") + "\u003E\u003C\u002Fiframe\u003E";
};
pug_mixins["video"] = pug_interp = function(videoType, url){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (videoType === 'youtube' || videoType === 'tumblr') {
pug_html = pug_html + "\n";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003Cdiv class=\"video-wrapper\"\u003E";
if (videoType === 'youtube') {
pug_html = pug_html + "\n  ";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003Cdiv" + (" data-type=\"youtube\""+pug.attr("data-video-id", url, true, false)) + "\u003E\u003C\u002Fdiv\u003E";
}
else {
pug_html = pug_html + "\n  ";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003Cvideo controls=\"controls\"\u003E\n    ";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003Csource" + (pug.attr("src", url, true, false)+" type=\"video\u002Fmp4\"") + "\u002F\u003E\n  ";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003C\u002Fvideo\u003E";
}
pug_html = pug_html + "\n";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
}
else
if (videoType === 'instagram') {
pug_html = pug_html + "\n";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003Cdiv class=\"instagram-iframe-wrapper\"\u003E";
pug_indent.push('  ');
pug_mixins["iframe"](url, 'instagram-iframe');
pug_indent.pop();
pug_html = pug_html + "\n";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
}
};
pug_mixins["media-button"] = pug_interp = function(url, tooltip, icon, external){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\n";
pug_html = pug_html + pug_indent.join("");
pug_html = pug_html + "\u003Cdiv" + (" class=\"footer-button\""+" data-container=\"body\" data-toggle=\"tooltip\" data-placement=\"bottom\""+pug.attr("title", tooltip, false, false)) + "\u003E\u003Ca" + (pug.attr("href", url, true, false)+pug.attr("target", external ? '_blank' : false, true, false)+pug.attr("rel", external ? 'noopener noreferrer' : false, true, false)+pug.attr("onclick", external ? 'javascript:window.open(this.href, \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600\');return false;' : false, true, false)) + "\u003E\u003Ci" + (pug.attr("class", pug.classes([icon], [true]), false, false)) + "\u003E\u003C\u002Fi\u003E\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E";
};












































































































;return pug_html;};