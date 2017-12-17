var APIs = {
	GameUI
}

function onPreloadF() {
	if(!Fusion.Commands.Fuzzing) {
		Fusion.Commands.Fuzzing = () => {

		}
		Game.AddCommand("__Fuzzing", Fusion.Commands.Fuzzing, "", 0)
	}
}

script = {
	name: "Fuzzer",
	onPreload: onPreloadF,
	isVisible: false
}