Multiproxy Switch is no longer maintained
======================

I decided to stop maintaining Multiproxy Switch. There are two main reasons for this:
* Existence of an alternative, superior [Multiproxy Switch fork](https://addons.mozilla.org/firefox/addon/proxy-selector/).
* Github's spontaneous [decision](https://github.com/blog/1302-goodbye-uploads) to end support for their downloads infrastructure. There was no warning of this transition period, and it breaks autoupdates for all Multiproxy Switch users. Prior warning could have allowed me to roll out a new version with an updated update URL.

As such, the following information remains for historical purposes only
======================


Introduction:
----------------------
Fork of [Multiproxy Switch 1.33](http://multiproxyswitch.blogspot.com/) because development there seems to have died.

Instructions:
----------------------
The .xpi file provided might not always be the latest version available.

To get the latest version, check out this repo, and zip the contents of the src folder.

Change the .zip file to .xpi, and add manually to Firefox

Requirements:
----------------------
Firefox 2.* - 13+

or

Thunderbird 1.* - 13+

Firefox/Thunderbird 10+ mark add-ons as compatible by default.

TODO:
----------------------
Enable DNS remote lookup on a per proxy basis (network.proxy.socks_remote_dns).
