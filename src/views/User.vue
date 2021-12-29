<template>
  <div id="user" v-if="user != null" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>{{ user.username }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn @click="save()" icon>
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-app-bar>

    <v-card class="pa-10">
      <v-row>
        <v-col cols="6">
          <v-text-field
            outlined
            label="العنوان"
            v-model="userdata.address"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            outlined
            hide-details
            label="رقم الهاتف الاول"
            v-model="userdata.phoneNumber"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            outlined
            hide-details
            label="رقم الهاتف الثاني"
            v-model="userdata.secondPhoneNumber"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            outlined
            label="الهدف الشهري للمبيعات"
            type="number"
            hide-details
            v-model="userdata.monthlyTarget"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-autocomplete
            outlined
            label="سعر البيع"
            hide-details
            v-model="userdata.sellPriceId"
            :items="sellPrices"
            item-text="sellPriceName"
            item-value="idSellPrice"
          ></v-autocomplete>
        </v-col>
        <v-col cols="3">
          <v-btn onclick="document.getElementById('filepicker').click()" block>
            <v-icon> mdi-cloud-outline </v-icon>
            &nbsp;&nbsp; تعديل صورة المستخدم
          </v-btn>
          <input
            id="filepicker"
            style="display: none"
            type="file"
            name="uploads"
            @change="selectFiles($event)"
            accept="image/png, image/gif, image/jpeg"
          />
          <img
            v-if="userdata.imagePath != null"
            :src="$baseUrl + 'files/' + userdata.imagePath"
            width="100%"
            id="imagePath"
          />
          <img
            v-if="userdata.imagePath == null"
            src="@/assets/no_image_placeholder.png"
            width="100%"
            id="imagePath"
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "User",
  data: () => ({
    userId: 0,
    userdata: {
      address: null,
      phoneNumber: null,
      secondPhoneNumber: null,
      imagePath: null,
      monthlyTarget: null,
      sellPriceId: 0,
    },
    user: null,
    sellPrices: [],
  }),
  created: function () {
    this.userId = this.$route.params.id;
    this.fetch();
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http.get(this.$baseUrl + "users/" + this.userId).then((res) => {
        this.user = res.data;
        this.$http
          .get(this.$baseUrl + "users/userinfo/" + this.userId)
          .then((res) => {
            this.userdata = res.data;
          })
          .catch((err) => {
            if (err.response.status == 404) {
              this.$http
                .post(this.$baseUrl + "users/new/userInfo", {
                  userId: this.userId * 1,
                  sellPriceId: 1,
                  monthlyTarget: 0,
                })
                .finally(() => {
                  this.fetch();
                  return;
                });
            }
          })
          .finally(() => loading.hide());
      });
      this.$http.get(this.$baseUrl + "sellprice").then((res) => {
        this.sellPrices = res.data;
      });
    },
    selectFiles(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      for (let i = 0; i < files.length; i++) {
        this.image = files[i];
      }
      let loading = this.$loading.show();
      let formData = new FormData();
      formData.append("userImage", this.image);
      this.$http
        .put(this.$baseUrl + "users/updateImage/" + this.userId, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: " تم تغيير الصورة",
            duration: 3000,
          });
          document
            .getElementById("imagePath")
            .setAttribute("src", URL.createObjectURL(this.image));
        })
        .finally(() => loading.hide());
    },
    save() {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "users/edit/userinfo/" + this.userId, {
          address: this.userdata.address,
          phoneNumber: this.userdata.phoneNumber,
          secondPhoneNumber: this.userdata.secondPhoneNumber,
          monthlyTarget: this.userdata.monthlyTarget,
          sellPriceId: this.userdata.sellPriceId,
        }).then(() => {
          this.$toast.open({
            type: "success",
            message: " تم تعديل المعومات",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>