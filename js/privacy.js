function applyTheme(e) {
	console.log("applyTheme");
	const isDarkMode = e.matches;
	document.documentElement.style.backgroundColor = isDarkMode ? 'black' : 'white';
	document.documentElement.style.color = isDarkMode ? 'white' : 'black';
}

// Initial check
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
applyTheme(darkModeMediaQuery);

// Listen for changes
darkModeMediaQuery.addEventListener('change', applyTheme);