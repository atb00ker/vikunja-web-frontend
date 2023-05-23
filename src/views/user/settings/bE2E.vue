<template>
	<h1 style="font-size: 25px; margin-bottom: 10px;">E2E Encryption</h1>
	<p>Enter key name (random string, eg. default) & valid AES-CBC valid key (Read `encrypt.md` if you are unsure about generating a valid key).
	</p>
	<form @submit="e2eEnable" style="margin-top: 10px;">
		<div class="form-control">
			<div style="margin-top: 5px;">
				<input placeholder="Key name" required type="text" v-model="e2eKeyName" />
			</div>
			<div style="margin-top: 5px;">
				<textarea rows="4" cols="50" placeholder="AES-CBC Key" required type="text" v-model="e2eKey"></textarea>
			</div>
		</div>
		<input type="submit" value="Enable" style="margin-top: 5px;" />
	</form>
	<button style="margin-top: 5px;" @click="e2eDisable">
		Disable
	</button>
</template>

<script lang="ts">
export default {
	name: 'user-settings-e2e', data() {
		return {
			e2eKeyName: '',
			e2eKey: '',
		}
	}, methods: {
		e2eEnable(event: any) {
			event.preventDefault()

			if (!this.e2eKey) {
				alert('No key provided.')
				return
			}

			localStorage.setItem("_aes_badcrypto_keyname", this.e2eKeyName);
			localStorage.setItem("_aes_badcrypto_key", this.e2eKey);
		},
		e2eDisable() {
			localStorage.removeItem("_aes_badcrypto_key");
			localStorage.removeItem("_aes_badcrypto_keyname");
		}
	},
}
</script>
