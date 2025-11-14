<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)
const message = ref<string | null>(null)
const error = ref<string | null>(null)

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

async function subscribe() {
  message.value = null
  error.value = null

  if (!isEmail(email.value)) {
    error.value = 'Merci d’entrer une adresse e-mail valide.'
    return
  }

  try {
    loading.value = true
    await $fetch('/api/newsletter', {
      method: 'POST',
      body: {
        email: email.value,
        source: 'homepage'
      }
    })
    message.value = 'Merci ! Vous êtes inscrit(e) à la newsletter.'
    email.value = ''
  } catch (e: any) {
    if (e?.status === 409) error.value = 'Cette adresse est déjà inscrite.'
    else if (e?.status === 400) error.value = 'Adresse invalide.'
    else error.value = 'Une erreur est survenue. Réessayez plus tard.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="nl">
    <div class="nl-inner">       
      <div class="nl-left">
        <h2 class="nl-title">Abonnez-vous à notre newsletter</h2>
        <form @submit.prevent="subscribe" class="nl-form">
          <input
            type="email"
            v-model="email"
            placeholder="votre@email.com"
            :disabled="loading"
            required
          />
          <button type="submit" :disabled="loading">
            {{ loading ? 'Envoi…' : 'S’inscrire' }}
          </button>
        </form>
        <p v-if="message" class="ok">{{ message }}</p>
        <p v-if="error" class="err">{{ error }}</p>
      </div>

      <div class="nl-right">
        <h2 class="nl-title">Suivez-nous</h2>   
        <div class="socials">
          <a href="https://www.instagram.com/lanombreuse" target="_blank" aria-label="Instagram">
            <img src="/instagram.png" alt="Instagram" />
          </a>
          <a href="https://www.facebook.com/lanombreuse" target="_blank" aria-label="Facebook">
            <img src="/facebook.png" alt="Facebook" />
          </a>
          <a href="https://www.linkedin.com/company/la-nombreuse" target="_blank" aria-label="LinkedIn">
            <img src="/linkedin.png" alt="LinkedIn" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>


<style scoped>

.nl {
  padding: 2rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}


.nl-inner{
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;

  display: flex;                 
  align-items: flex-start;
  justify-content: space-between;
  gap: 48px;
  flex-wrap: nowrap;            
}


.nl-left{
  flex: 1 1 0;
  min-width: 420px;              
  max-width: 720px;              
}


.nl-right{
  flex: 0 0 360px;               
  min-width: 300px;              
}

/* Titres harmonisés */
.nl-title{
  font-size: 22px;
  line-height: 1.2;
  margin: 0 0 12px;
  font-weight: 700;
}

/* Formulaire */
.nl-form{
  display: flex;
  gap: .75rem;
  max-width: 540px;
  margin-top: .25rem;
}
.nl-form input{
  flex: 1;
  padding: .75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.nl-form button{
  padding: .75rem 1rem;
  border-radius: 8px;
  border: 1px solid #000;
  background: #000;
  color: #fff;
  cursor: pointer;
  transition: background .2s;
}
.nl-form button:hover{ background:#333; }


.socials{
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: .5rem;
}
.socials img{
  width: 28px; height: 28px;
  transition: opacity .2s;
}
.socials a:hover img{ opacity: .7; }

/* Messages */
.ok{ color:#177245; margin-top:.5rem; }
.err{ color:#b00020; margin-top:.5rem; }

/* --- Responsive: on empile sous ~980px --- */
@media (max-width: 980px){
  .nl-inner{ flex-direction: column; gap: 24px; }
  .nl-left, .nl-right{ flex: 0 0 auto; min-width: 0; max-width: none; }
}

</style>
